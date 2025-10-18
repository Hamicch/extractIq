import { Document } from '../../domain/document/document.entity';
import { DocumentRepository } from '../../ports/repositories/document.repository';
import { FileStorageService, UploadedFile } from '../../ports/services/file-storage.service';
import { QueueService } from '../../ports/services/queue.service';
import { Result } from '../../types/result';
import { v4 as uuidv4 } from 'uuid';

export interface UploadDocumentRequest {
  file: UploadedFile;
  tenantId: string;
  uploadedBy: string;
}

export interface UploadDocumentResponse {
  documentId: string;
  status: string;
}

/**
 * Upload Document Use Case
 * Handles document upload, storage, and queuing for processing
 */
export class UploadDocumentUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly fileStorage: FileStorageService,
    private readonly queueService: QueueService
  ) {}

  async execute(
    request: UploadDocumentRequest
  ): Promise<Result<UploadDocumentResponse, Error>> {
    try {
      const documentId = uuidv4();

      // 1. Upload file to storage
      const uploadResult = await this.fileStorage.upload(
        request.file,
        request.tenantId,
        documentId
      );

      if (uploadResult.isFailure) {
        return Result.fail(uploadResult.getError());
      }

      const storedFile = uploadResult.getValue();

      // 2. Create document entity
      const document = Document.create(documentId, request.tenantId, storedFile.filePath, {
        originalName: request.file.originalName,
        size: request.file.size,
        mimeType: request.file.mimeType,
        uploadedBy: request.uploadedBy,
      });

      // 3. Save document to database
      await this.documentRepository.save(document);

      // 4. Queue document for processing
      const queueResult = await this.queueService.add('process-document', {
        documentId: document.id,
        tenantId: document.tenantId,
      });

      if (queueResult.isFailure) {
        // Document is uploaded but not queued - can be retried manually
        console.error('Failed to queue document for processing:', queueResult.getError());
      }

      return Result.ok({
        documentId: document.id,
        status: document.status,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
