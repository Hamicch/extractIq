import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { db } from '@extractiq/db';
import { apiKeys } from '@extractiq/db/schema';
import { eq } from 'drizzle-orm';
import { createHash } from 'crypto';

interface AuthenticatedSocket extends Socket {
  tenantId?: string;
  userId?: string;
}

export class WebSocketServer {
  private io: SocketIOServer;
  private connectedClients: Map<string, Set<string>> = new Map(); // tenantId -> Set of socket IDs

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token as string;

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Special token for worker (internal communication)
        if (
          token === process.env.WORKER_API_KEY ||
          token === 'worker-internal-key'
        ) {
          socket.tenantId = 'worker';
          socket.userId = 'worker';
          return next();
        }

        // Hash the provided API key
        const keyHash = createHash('sha256').update(token).digest('hex');

        // Look up API key in database
        const [apiKey] = await db
          .select()
          .from(apiKeys)
          .where(eq(apiKeys.keyHash, keyHash))
          .limit(1);

        if (!apiKey) {
          return next(new Error('Invalid API key'));
        }

        // Attach tenant ID to socket
        socket.tenantId = apiKey.tenantId;
        socket.userId = apiKey.name;

        // Update last used timestamp
        await db
          .update(apiKeys)
          .set({ lastUsedAt: new Date() })
          .where(eq(apiKeys.id, apiKey.id));

        next();
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const { tenantId, userId } = socket;

      console.log(
        `✅ Client connected: ${socket.id} (tenant: ${tenantId}, user: ${userId})`
      );

      // Join tenant-specific room
      if (tenantId) {
        socket.join(`tenant:${tenantId}`);

        // Track connected clients
        if (!this.connectedClients.has(tenantId)) {
          this.connectedClients.set(tenantId, new Set());
        }
        this.connectedClients.get(tenantId)!.add(socket.id);

        console.log(`📡 Client ${socket.id} joined room: tenant:${tenantId}`);
      }

      // Heartbeat mechanism
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
      });

      // Handle disconnect
      socket.on('disconnect', (reason) => {
        console.log(`❌ Client disconnected: ${socket.id} (reason: ${reason})`);

        // Remove from tracking
        if (tenantId) {
          const clients = this.connectedClients.get(tenantId);
          if (clients) {
            clients.delete(socket.id);
            if (clients.size === 0) {
              this.connectedClients.delete(tenantId);
            }
          }
        }
      });

      // Worker events (broadcast to tenant rooms)
      if (tenantId === 'worker') {
        socket.on('document:status', (event: any) => {
          this.broadcastToTenant(event.tenantId, 'document:status', event);
        });

        socket.on('document:progress', (event: any) => {
          this.broadcastToTenant(event.tenantId, 'document:progress', event);
        });

        socket.on('document:completed', (event: any) => {
          this.broadcastToTenant(event.tenantId, 'document:completed', event);
        });

        socket.on('document:failed', (event: any) => {
          this.broadcastToTenant(event.tenantId, 'document:failed', event);
        });
      }
    });
  }

  private broadcastToTenant(tenantId: string, event: string, data: any): void {
    const room = `tenant:${tenantId}`;
    this.io.to(room).emit(event, data);

    const clientCount = this.connectedClients.get(tenantId)?.size || 0;
    console.log(`📤 Broadcast ${event} to ${clientCount} clients in ${room}`);
  }

  public getIO(): SocketIOServer {
    return this.io;
  }

  public getConnectedClientsCount(tenantId: string): number {
    return this.connectedClients.get(tenantId)?.size || 0;
  }

  public getAllConnectedClients(): Map<string, number> {
    const result = new Map<string, number>();
    for (const [tenantId, clients] of this.connectedClients.entries()) {
      result.set(tenantId, clients.size);
    }
    return result;
  }
}
