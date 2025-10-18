import { ConnectedClient } from '../types/socket.types';

/**
 * Service for tracking connected WebSocket clients
 * Maintains a registry of active connections by tenant
 */
export class ClientTrackingService {
  private clients: Map<string, ConnectedClient> = new Map(); // socketId -> ConnectedClient
  private tenantClients: Map<string, Set<string>> = new Map(); // tenantId -> Set of socket IDs

  /**
   * Add a new connected client
   */
  addClient(socketId: string, tenantId: string, userId: string): void {
    // Add to clients registry
    this.clients.set(socketId, {
      socketId,
      tenantId,
      userId,
      connectedAt: new Date(),
    });

    // Add to tenant tracking
    if (!this.tenantClients.has(tenantId)) {
      this.tenantClients.set(tenantId, new Set());
    }
    this.tenantClients.get(tenantId)!.add(socketId);

    console.log(
      `📊 Client tracking: ${socketId} added (Total for tenant ${tenantId}: ${this.getClientCountByTenant(tenantId)})`
    );
  }

  /**
   * Remove a disconnected client
   */
  removeClient(socketId: string, tenantId: string): void {
    // Remove from clients registry
    this.clients.delete(socketId);

    // Remove from tenant tracking
    const tenantSockets = this.tenantClients.get(tenantId);
    if (tenantSockets) {
      tenantSockets.delete(socketId);
      if (tenantSockets.size === 0) {
        this.tenantClients.delete(tenantId);
      }
    }

    console.log(
      `📊 Client tracking: ${socketId} removed (Total for tenant ${tenantId}: ${this.getClientCountByTenant(tenantId)})`
    );
  }

  /**
   * Get number of connected clients for a tenant
   */
  getClientCountByTenant(tenantId: string): number {
    return this.tenantClients.get(tenantId)?.size || 0;
  }

  /**
   * Get all connected clients for a tenant
   */
  getClientsByTenant(tenantId: string): ConnectedClient[] {
    const socketIds = this.tenantClients.get(tenantId);
    if (!socketIds) {
      return [];
    }

    const clients: ConnectedClient[] = [];
    for (const socketId of socketIds) {
      const client = this.clients.get(socketId);
      if (client) {
        clients.push(client);
      }
    }

    return clients;
  }

  /**
   * Get total number of connected clients across all tenants
   */
  getTotalClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get client counts by tenant
   */
  getAllClientCounts(): Map<string, number> {
    const result = new Map<string, number>();
    for (const [tenantId, socketIds] of this.tenantClients.entries()) {
      result.set(tenantId, socketIds.size);
    }
    return result;
  }
}
