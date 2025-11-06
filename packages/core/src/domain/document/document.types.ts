export enum DocumentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum DocumentType {
  INVOICE = 'invoice',
  CONTRACT = 'contract',
  RECEIPT = 'receipt',
  GENERIC = 'generic',
}

export interface DocumentMetadata {
  originalName: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
}

export interface ExtractionResult {
  type: DocumentType;
  confidence: number;
  data: Record<string, any>;
  extractedAt: Date;
}
