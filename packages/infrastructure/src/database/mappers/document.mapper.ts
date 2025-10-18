import { Document, DocumentStatus, DocumentType, ExtractionResult } from '@extractiq/core';
import { DocumentRow, NewDocumentRow } from '../drizzle/schema/documents.schema';

/**
 * Maps between Document domain entity and database row
 */
export class DocumentMapper {
  /**
   * Convert database row to domain entity
   */
  static toDomain(row: DocumentRow): Document {
    return Document.reconstitute(
      row.id,
      row.tenantId,
      row.filePath,
      {
        originalName: row.originalName,
        size: row.size,
        mimeType: row.mimeType,
        uploadedBy: row.uploadedBy,
      },
      row.status as DocumentStatus,
      row.type as DocumentType | undefined,
      row.extractedData as ExtractionResult | undefined,
      row.errorMessage || undefined,
      row.createdAt,
      row.updatedAt
    );
  }

  /**
   * Convert domain entity to database row (for insert/update)
   */
  static toPersistence(document: Document): NewDocumentRow {
    return {
      id: document.id,
      tenantId: document.tenantId,
      filePath: document.filePath,
      originalName: document.metadata.originalName,
      size: document.metadata.size,
      mimeType: document.metadata.mimeType,
      uploadedBy: document.metadata.uploadedBy,
      status: document.status,
      type: document.type,
      extractedData: document.extractedData as any,
      errorMessage: document.errorMessage,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }

  /**
   * Convert array of rows to domain entities
   */
  static toDomainList(rows: DocumentRow[]): Document[] {
    return rows.map((row) => this.toDomain(row));
  }
}
