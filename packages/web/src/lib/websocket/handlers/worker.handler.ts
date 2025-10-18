import { AuthenticatedSocket } from '../types/socket.types';
import {
  DocumentEvent,
  DocumentEventType,
  DocumentStatusEvent,
  DocumentProgressEvent,
  DocumentCompletedEvent,
  DocumentFailedEvent,
} from '../types/events.types';
import { BroadcastService } from '../services/broadcast.service';

/**
 * Handles WebSocket events from worker process
 * Workers broadcast document processing events to tenant clients
 */
export class WorkerHandler {
  constructor(private readonly broadcast: BroadcastService) {}

  /**
   * Setup worker event listeners
   * Only workers (authenticated as tenantId='worker') can emit these events
   */
  setupWorkerEvents(socket: AuthenticatedSocket): void {
    // Only allow worker to emit these events
    if (socket.tenantId !== 'worker') {
      return;
    }

    // Document status change
    socket.on(DocumentEventType.STATUS, (event: DocumentStatusEvent) => {
      this.broadcast.broadcastToTenant(
        event.tenantId,
        DocumentEventType.STATUS,
        event
      );
    });

    // Document processing progress
    socket.on(DocumentEventType.PROGRESS, (event: DocumentProgressEvent) => {
      this.broadcast.broadcastToTenant(
        event.tenantId,
        DocumentEventType.PROGRESS,
        event
      );
    });

    // Document processing completed
    socket.on(DocumentEventType.COMPLETED, (event: DocumentCompletedEvent) => {
      this.broadcast.broadcastToTenant(
        event.tenantId,
        DocumentEventType.COMPLETED,
        event
      );
    });

    // Document processing failed
    socket.on(DocumentEventType.FAILED, (event: DocumentFailedEvent) => {
      this.broadcast.broadcastToTenant(
        event.tenantId,
        DocumentEventType.FAILED,
        event
      );
    });

    console.log(`🔧 Worker event handlers registered for socket ${socket.id}`);
  }
}
