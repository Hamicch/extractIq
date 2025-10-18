import { Socket } from 'socket.io';

/**
 * Authenticated socket with tenant and user information
 */
export interface AuthenticatedSocket extends Socket {
  tenantId: string;
  userId: string;
}

/**
 * Socket authentication data
 */
export interface SocketAuthData {
  token: string;
}

/**
 * Client tracking information
 */
export interface ConnectedClient {
  socketId: string;
  tenantId: string;
  userId: string;
  connectedAt: Date;
}
