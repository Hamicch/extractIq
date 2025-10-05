import { io, Socket } from 'socket.io-client';
import type {
  DocumentStatusEvent,
  DocumentProgressEvent,
  DocumentCompletedEvent,
  DocumentFailedEvent,
} from '@docuflow/shared';

class WebSocketClient {
  private socket: Socket | null = null;
  private readonly url: string;

  constructor() {
    this.url = process.env.API_URL || 'http://localhost:4000';
  }

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.url, {
      auth: {
        token: process.env.WORKER_API_KEY || 'worker-internal-key',
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected to API server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`⚠️  WebSocket disconnected: ${reason}`);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emitStatus(event: DocumentStatusEvent): void {
    if (!this.socket?.connected) {
      console.warn('⚠️  WebSocket not connected, cannot emit status event');
      return;
    }

    this.socket.emit('document:status', event);
  }

  emitProgress(event: DocumentProgressEvent): void {
    if (!this.socket?.connected) {
      console.warn('⚠️  WebSocket not connected, cannot emit progress event');
      return;
    }

    this.socket.emit('document:progress', event);
  }

  emitCompleted(event: DocumentCompletedEvent): void {
    if (!this.socket?.connected) {
      console.warn('⚠️  WebSocket not connected, cannot emit completed event');
      return;
    }

    this.socket.emit('document:completed', event);
  }

  emitFailed(event: DocumentFailedEvent): void {
    if (!this.socket?.connected) {
      console.warn('⚠️  WebSocket not connected, cannot emit failed event');
      return;
    }

    this.socket.emit('document:failed', event);
  }
}

export const wsClient = new WebSocketClient();
