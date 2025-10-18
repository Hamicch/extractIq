import { Document } from '../../domain/document/document.entity';
import { DocumentRepository } from '../../ports/repositories/document.repository';
import { Result } from '../../types/result';
import { NotFoundError, ForbiddenError } from '../../types/errors';

export interface GetDocumentRequest {
  documentId: string;
  tenantId: string; // For authorization
}

/**
 * Get Document Use Case
 * Retrieves a single document with authorization check
 */
export class GetDocumentUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(request: GetDocumentRequest): Promise<Result<Document, Error>> {
    try {
      const document = await this.documentRepository.findById(request.documentId);

      if (!document) {
        return Result.fail(new NotFoundError('Document', request.documentId));
      }

      // Authorization check
      if (document.tenantId !== request.tenantId) {
        return Result.fail(
          new ForbiddenError('You do not have access to this document')
        );
      }

      return Result.ok(document);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
