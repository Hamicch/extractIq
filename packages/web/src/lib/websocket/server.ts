import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from './types/socket.types';
import { authMiddleware } from './middleware/auth.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { ConnectionHandler } from './handlers/connection.handler';
import { HeartbeatHandler } from './handlers/heartbeat.handler';
import { WorkerHandler } from './handlers/worker.handler';
import { ClientTrackingService } from './services/client-tracking.service';
import { BroadcastService } from './services/broadcast.service';

/**
 * WebSocket Server
 * Manages real-time communication between clients, API, and workers
 *
 * Features:
 * - API key authentication
 * - Multi-tenant room support
 * - Client connection tracking
 * - Document processing event broadcasting
 * - Heartbeat mechanism
 */
export class WebSocketServer {
  private io: SocketIOServer;
  private clientTracking: ClientTrackingService;
  private broadcast: BroadcastService;
  private connectionHandler: ConnectionHandler;
  private heartbeatHandler: HeartbeatHandler;
  private workerHandler: WorkerHandler;

  constructor(httpServer: HttpServer) {
    // Initialize Socket.IO server
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    // Initialize services
    this.clientTracking = new ClientTrackingService();
    this.broadcast = new BroadcastService(this.io, this.clientTracking);

    // Initialize handlers
    this.connectionHandler = new ConnectionHandler(this.clientTracking);
    this.heartbeatHandler = new HeartbeatHandler();
    this.workerHandler = new WorkerHandler(this.broadcast);

    // Setup middleware and event handlers
    this.setupMiddleware();
    this.setupEventHandlers();

    console.log('✅ WebSocket server initialized');
  }

  /**
   * Setup Socket.IO middleware
   */
  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(authMiddleware);

    // Error handling middleware
    this.io.use(errorMiddleware);
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      // Handle connection
      this.connectionHandler.handleConnection(socket);

      // Setup heartbeat
      this.heartbeatHandler.setupHeartbeat(socket);

      // Setup worker events (only for worker sockets)
      this.workerHandler.setupWorkerEvents(socket);

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        this.connectionHandler.handleDisconnection(socket, reason);
      });
    });
  }

  /**
   * Get Socket.IO server instance
   * Useful for integration with other services
   */
  public getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Get broadcast service
   * Allows external services to broadcast events
   */
  public getBroadcastService(): BroadcastService {
    return this.broadcast;
  }

  /**
   * Get number of connected clients for a tenant
   */
  public getConnectedClientsCount(tenantId: string): number {
    return this.clientTracking.getClientCountByTenant(tenantId);
  }

  /**
   * Get client counts for all tenants
   */
  public getAllConnectedClients(): Map<string, number> {
    return this.clientTracking.getAllClientCounts();
  }

  /**
   * Get broadcast statistics
   */
  public getStats() {
    return this.broadcast.getStats();
  }

  /**
   * Gracefully close WebSocket server
   */
  public async close(): Promise<void> {
    return new Promise((resolve) => {
      this.io.close(() => {
        console.log('✅ WebSocket server closed');
        resolve();
      });
    });
  }
}
