import { BaseEntity } from '../shared/base-entity';
import { InvalidOperationError } from '../../types/errors';
import {
  DocumentStatus,
  DocumentType,
  DocumentMetadata,
  ExtractionResult,
} from './document.types';

export class Document extends BaseEntity {
  private constructor(
    id: string,
    public readonly tenantId: string,
    public readonly filePath: string,
    public readonly metadata: DocumentMetadata,
    public status: DocumentStatus,
    public type?: DocumentType,
    public extractedData?: ExtractionResult,
    public errorMessage?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    super(id);
  }

  public static create(
    id: string,
    tenantId: string,
    filePath: string,
    metadata: DocumentMetadata
  ): Document {
    return new Document(
      id,
      tenantId,
      filePath,
      metadata,
      DocumentStatus.PENDING
    );
  }

  public static reconstitute(
    id: string,
    tenantId: string,
    filePath: string,
    metadata: DocumentMetadata,
    status: DocumentStatus,
    type?: DocumentType,
    extractedData?: ExtractionResult,
    errorMessage?: string,
    createdAt?: Date,
    updatedAt?: Date
  ): Document {
    return new Document(
      id,
      tenantId,
      filePath,
      metadata,
      status,
      type,
      extractedData,
      errorMessage,
      createdAt,
      updatedAt
    );
  }

  public markAsProcessing(): void {
    if (this.status !== DocumentStatus.PENDING) {
      throw new InvalidOperationError(
        'markAsProcessing',
        `Document must be in PENDING status, current status: ${this.status}`
      );
    }
    this.status = DocumentStatus.PROCESSING;
    this.updatedAt = new Date();
  }

  public setType(type: DocumentType): void {
    if (this.status !== DocumentStatus.PROCESSING) {
      throw new InvalidOperationError(
        'setType',
        `Document must be in PROCESSING status, current status: ${this.status}`
      );
    }
    this.type = type;
    this.updatedAt = new Date();
  }

  public complete(extractedData: ExtractionResult): void {
    if (this.status !== DocumentStatus.PROCESSING) {
      throw new InvalidOperationError(
        'complete',
        `Document must be in PROCESSING status, current status: ${this.status}`
      );
    }
    this.status = DocumentStatus.COMPLETED;
    this.extractedData = extractedData;
    this.errorMessage = undefined;
    this.updatedAt = new Date();
  }

  public fail(errorMessage: string): void {
    if (this.status !== DocumentStatus.PROCESSING) {
      throw new InvalidOperationError(
        'fail',
        `Document must be in PROCESSING status, current status: ${this.status}`
      );
    }
    this.status = DocumentStatus.FAILED;
    this.errorMessage = errorMessage;
    this.updatedAt = new Date();
  }

  public canRetry(): boolean {
    return this.status === DocumentStatus.FAILED;
  }

  public retry(): void {
    if (!this.canRetry()) {
      throw new InvalidOperationError(
        'retry',
        `Document must be in FAILED status to retry, current status: ${this.status}`
      );
    }
    this.status = DocumentStatus.PENDING;
    this.errorMessage = undefined;
    this.updatedAt = new Date();
  }

  public isPending(): boolean {
    return this.status === DocumentStatus.PENDING;
  }

  public isProcessing(): boolean {
    return this.status === DocumentStatus.PROCESSING;
  }

  public isCompleted(): boolean {
    return this.status === DocumentStatus.COMPLETED;
  }

  public isFailed(): boolean {
    return this.status === DocumentStatus.FAILED;
  }
}
