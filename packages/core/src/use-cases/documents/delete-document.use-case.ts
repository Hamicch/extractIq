import { DocumentRepository } from '../../ports/repositories/document.repository';
import { FileStorageService } from '../../ports/services/file-storage.service';
import { Result } from '../../types/result';
import { NotFoundError, ForbiddenError } from '../../types/errors';

export interface DeleteDocumentRequest {
  documentId: string;
  tenantId: string; // For authorization
}

/**
 * Delete Document Use Case
 * Deletes a document and its associated file
 */
export class DeleteDocumentUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly fileStorage: FileStorageService
  ) {}

  async execute(request: DeleteDocumentRequest): Promise<Result<void, Error>> {
    try {
      // 1. Get document
      const document = await this.documentRepository.findById(request.documentId);

      if (!document) {
        return Result.fail(new NotFoundError('Document', request.documentId));
      }

      // 2. Authorization check
      if (document.tenantId !== request.tenantId) {
        return Result.fail(
          new ForbiddenError('You do not have access to this document')
        );
      }

      // 3. Delete file from storage
      const deleteResult = await this.fileStorage.delete(document.filePath);
      if (deleteResult.isFailure) {
        console.error('Failed to delete file from storage:', deleteResult.getError());
        // Continue with database deletion even if file deletion fails
      }

      // 4. Delete document from database
      await this.documentRepository.delete(document.id);

      return Result.ok();
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
