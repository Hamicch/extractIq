/**
 * Document event types
 */
export enum DocumentEventType {
  STATUS = 'document:status',
  PROGRESS = 'document:progress',
  COMPLETED = 'document:completed',
  FAILED = 'document:failed',
}

/**
 * Base document event
 */
export interface BaseDocumentEvent {
  documentId: string;
  tenantId: string;
  timestamp: number;
}

/**
 * Document status change event
 */
export interface DocumentStatusEvent extends BaseDocumentEvent {
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

/**
 * Document processing progress event
 */
export interface DocumentProgressEvent extends BaseDocumentEvent {
  stage: 'text_extraction' | 'type_detection' | 'data_extraction';
  progress: number; // 0-100
  documentType?: string;
}

/**
 * Document completed event
 */
export interface DocumentCompletedEvent extends BaseDocumentEvent {
  status: 'completed';
  type: string;
  extractedData: any;
}

/**
 * Document failed event
 */
export interface DocumentFailedEvent extends BaseDocumentEvent {
  error: string;
}

/**
 * Union type of all document events
 */
export type DocumentEvent =
  | DocumentStatusEvent
  | DocumentProgressEvent
  | DocumentCompletedEvent
  | DocumentFailedEvent;

/**
 * Heartbeat events
 */
export interface PingEvent {
  timestamp: number;
}

export interface PongEvent {
  timestamp: number;
}
