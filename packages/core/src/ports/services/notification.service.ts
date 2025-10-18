import { Result } from '../../types/result';

export interface DocumentNotification {
  documentId: string;
  tenantId: string;
  type: 'status' | 'progress' | 'completed' | 'failed';
  data: any;
}

/**
 * Notification Service interface (port)
 * Infrastructure layer will implement this with WebSocket
 */
export interface NotificationService {
  /**
   * Send notification to tenant
   */
  notify(notification: DocumentNotification): Promise<Result<void, Error>>;

  /**
   * Send notification to specific user
   */
  notifyUser(
    userId: string,
    notification: DocumentNotification
  ): Promise<Result<void, Error>>;

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(tenantId: string): Promise<number>;
}
