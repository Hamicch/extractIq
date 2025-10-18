import { DocumentRepository } from '../../ports/repositories/document.repository';
import { AiExtractorService } from '../../ports/services/ai-extractor.service';
import { NotificationService } from '../../ports/services/notification.service';
import { Result } from '../../types/result';
import { NotFoundError } from '../../types/errors';

export interface ProcessDocumentRequest {
  documentId: string;
}

/**
 * Process Document Use Case
 * Handles the complete document processing pipeline:
 * 1. Extract text from PDF
 * 2. Detect document type
 * 3. Extract structured data
 * 4. Update document status
 * 5. Send notifications
 */
export class ProcessDocumentUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly aiExtractor: AiExtractorService,
    private readonly notificationService: NotificationService
  ) {}

  async execute(request: ProcessDocumentRequest): Promise<Result<void, Error>> {
    try {
      // 1. Get document
      const document = await this.documentRepository.findById(request.documentId);
      if (!document) {
        return Result.fail(new NotFoundError('Document', request.documentId));
      }

      // 2. Mark as processing
      document.markAsProcessing();
      await this.documentRepository.save(document);

      // Notify status change
      await this.notificationService.notify({
        documentId: document.id,
        tenantId: document.tenantId,
        type: 'status',
        data: { status: document.status },
      });

      // 3. Extract text from PDF
      const textResult = await this.aiExtractor.extractText(document.filePath);
      if (textResult.isFailure) {
        document.fail(`Text extraction failed: ${textResult.getError().message}`);
        await this.documentRepository.save(document);
        await this.notifyFailure(document.id, document.tenantId, textResult.getError().message);
        return Result.fail(textResult.getError());
      }

      const { text } = textResult.getValue();

      // Notify progress
      await this.notificationService.notify({
        documentId: document.id,
        tenantId: document.tenantId,
        type: 'progress',
        data: { stage: 'text_extraction', progress: 33 },
      });

      // 4. Detect document type
      const typeResult = await this.aiExtractor.detectType(text);
      if (typeResult.isFailure) {
        document.fail(`Type detection failed: ${typeResult.getError().message}`);
        await this.documentRepository.save(document);
        await this.notifyFailure(document.id, document.tenantId, typeResult.getError().message);
        return Result.fail(typeResult.getError());
      }

      const { type } = typeResult.getValue();
      document.setType(type);
      await this.documentRepository.save(document);

      // Notify progress
      await this.notificationService.notify({
        documentId: document.id,
        tenantId: document.tenantId,
        type: 'progress',
        data: { stage: 'type_detection', progress: 66, documentType: type },
      });

      // 5. Extract structured data
      const extractionResult = await this.aiExtractor.extractData(text, type);
      if (extractionResult.isFailure) {
        document.fail(`Data extraction failed: ${extractionResult.getError().message}`);
        await this.documentRepository.save(document);
        await this.notifyFailure(document.id, document.tenantId, extractionResult.getError().message);
        return Result.fail(extractionResult.getError());
      }

      const extractedData = extractionResult.getValue();

      // 6. Complete document
      document.complete(extractedData);
      await this.documentRepository.save(document);

      // Notify completion
      await this.notificationService.notify({
        documentId: document.id,
        tenantId: document.tenantId,
        type: 'completed',
        data: {
          status: document.status,
          type: document.type,
          extractedData: document.extractedData,
        },
      });

      return Result.ok();
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  private async notifyFailure(
    documentId: string,
    tenantId: string,
    errorMessage: string
  ): Promise<void> {
    await this.notificationService.notify({
      documentId,
      tenantId,
      type: 'failed',
      data: { error: errorMessage },
    });
  }
}
