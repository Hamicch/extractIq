import { Document } from '../../domain/document/document.entity';
import { DocumentStatus } from '../../domain/document/document.types';
import { PaginationParams, PaginatedResult } from '../../types/pagination';

/**
 * Document repository interface (port)
 * Infrastructure layer will implement this
 */
export interface DocumentRepository {
  /**
   * Find document by ID
   */
  findById(id: string): Promise<Document | null>;

  /**
   * Find documents by tenant ID with pagination
   */
  findByTenantId(
    tenantId: string,
    params: PaginationParams
  ): Promise<PaginatedResult<Document>>;

  /**
   * Find documents by status
   */
  findByStatus(
    tenantId: string,
    status: DocumentStatus,
    params: PaginationParams
  ): Promise<PaginatedResult<Document>>;

  /**
   * Save document (create or update)
   */
  save(document: Document): Promise<void>;

  /**
   * Delete document by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Check if document exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Count documents by tenant
   */
  countByTenant(tenantId: string): Promise<number>;

  /**
   * Count documents by status
   */
  countByStatus(tenantId: string, status: DocumentStatus): Promise<number>;

  /**
   * Find documents uploaded in a date range
   */
  findByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    params: PaginationParams
  ): Promise<PaginatedResult<Document>>;
}
