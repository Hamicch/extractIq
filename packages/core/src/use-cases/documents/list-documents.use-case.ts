import { Document } from '../../domain/document/document.entity';
import { DocumentRepository } from '../../ports/repositories/document.repository';
import { PaginationParams, PaginatedResult } from '../../types/pagination';
import { Result } from '../../types/result';
import { DocumentStatus } from '../../domain/document/document.types';

export interface ListDocumentsRequest {
  tenantId: string;
  pagination: PaginationParams;
  status?: DocumentStatus;
}

/**
 * List Documents Use Case
 * Retrieves paginated list of documents for a tenant
 */
export class ListDocumentsUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(
    request: ListDocumentsRequest
  ): Promise<Result<PaginatedResult<Document>, Error>> {
    try {
      let result: PaginatedResult<Document>;

      if (request.status) {
        result = await this.documentRepository.findByStatus(
          request.tenantId,
          request.status,
          request.pagination
        );
      } else {
        result = await this.documentRepository.findByTenantId(
          request.tenantId,
          request.pagination
        );
      }

      return Result.ok(result);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
