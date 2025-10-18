import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';

/**
 * WebSocket error handling middleware
 * Logs errors and ensures proper error messages are sent to client
 */
export function errorMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void
): void {
  socket.on('error', (error: Error) => {
    console.error(`WebSocket error on socket ${socket.id}:`, error);

    // Emit error to client
    socket.emit('error', {
      message: error.message || 'An error occurred',
      timestamp: Date.now(),
    });
  });

  next();
}
