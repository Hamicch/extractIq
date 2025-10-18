import { NotificationService, DocumentNotification, Result } from '@extractiq/core';

/**
 * Simple notification service implementation
 * This will be replaced with WebSocket implementation in Phase 2
 */
export class ConsoleNotificationService implements NotificationService {
  async notify(notification: DocumentNotification): Promise<Result<void, Error>> {
    console.log('[NOTIFICATION]', notification.type, notification);
    return Result.ok();
  }

  async notifyUser(
    userId: string,
    notification: DocumentNotification
  ): Promise<Result<void, Error>> {
    console.log('[USER NOTIFICATION]', userId, notification.type, notification);
    return Result.ok();
  }

  async getConnectedClientsCount(tenantId: string): Promise<number> {
    return 0; // No clients connected in console mode
  }
}
