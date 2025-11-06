import { AuthenticatedSocket } from '../types/socket.types';
import { ClientTrackingService } from '../services/client-tracking.service';

/**
 * Handles WebSocket connection events
 */
export class ConnectionHandler {
  constructor(private readonly clientTracking: ClientTrackingService) {}

  /**
   * Handle new client connection
   */
  handleConnection(socket: AuthenticatedSocket): void {
    const { tenantId, userId } = socket;

    console.log(
      `✅ Client connected: ${socket.id} (tenant: ${tenantId}, user: ${userId})`
    );

    // Join tenant-specific room
    if (tenantId) {
      socket.join(`tenant:${tenantId}`);
      console.log(`📡 Client ${socket.id} joined room: tenant:${tenantId}`);

      // Track connected client
      this.clientTracking.addClient(socket.id, tenantId, userId);
    }

    // Send connection acknowledgment
    socket.emit('connected', {
      socketId: socket.id,
      tenantId,
      userId,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle client disconnection
   */
  handleDisconnection(socket: AuthenticatedSocket, reason: string): void {
    const { tenantId } = socket;

    console.log(`❌ Client disconnected: ${socket.id} (reason: ${reason})`);

    // Remove from tracking
    if (tenantId) {
      this.clientTracking.removeClient(socket.id, tenantId);
    }
  }
}
