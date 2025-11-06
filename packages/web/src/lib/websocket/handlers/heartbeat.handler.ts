import { AuthenticatedSocket } from '../types/socket.types';
import { PingEvent, PongEvent } from '../types/events.types';

/**
 * Handles WebSocket heartbeat (ping/pong) events
 * Keeps connections alive and monitors client health
 */
export class HeartbeatHandler {
  /**
   * Setup heartbeat listeners for a socket
   */
  setupHeartbeat(socket: AuthenticatedSocket): void {
    socket.on('ping', (_data: PingEvent) => {
      const pongData: PongEvent = {
        timestamp: Date.now(),
      };

      socket.emit('pong', pongData);
    });
  }
}
