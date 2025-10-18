import { Server as SocketIOServer } from 'socket.io';
import { DocumentEventType } from '../types/events.types';
import { ClientTrackingService } from './client-tracking.service';

/**
 * Service for broadcasting events to WebSocket clients
 * Handles room-based broadcasting for multi-tenant support
 */
export class BroadcastService {
  constructor(
    private readonly io: SocketIOServer,
    private readonly clientTracking: ClientTrackingService
  ) {}

  /**
   * Broadcast event to all clients in a tenant's room
   */
  broadcastToTenant(tenantId: string, event: DocumentEventType | string, data: any): void {
    const room = `tenant:${tenantId}`;
    this.io.to(room).emit(event, data);

    const clientCount = this.clientTracking.getClientCountByTenant(tenantId);
    console.log(`📤 Broadcast ${event} to ${clientCount} clients in ${room}`);
  }

  /**
   * Broadcast event to a specific socket
   */
  broadcastToSocket(socketId: string, event: string, data: any): void {
    this.io.to(socketId).emit(event, data);
    console.log(`📤 Broadcast ${event} to socket ${socketId}`);
  }

  /**
   * Broadcast event to all connected clients (global broadcast)
   */
  broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data);
    const totalClients = this.clientTracking.getTotalClientCount();
    console.log(`📤 Global broadcast ${event} to ${totalClients} clients`);
  }

  /**
   * Get broadcast statistics
   */
  getStats(): {
    totalClients: number;
    clientsByTenant: Map<string, number>;
  } {
    return {
      totalClients: this.clientTracking.getTotalClientCount(),
      clientsByTenant: this.clientTracking.getAllClientCounts(),
    };
  }
}
