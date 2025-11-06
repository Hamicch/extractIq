import {
  DocumentRepository,
  Document,
  DocumentStatus,
  PaginationParams,
  PaginatedResult,
  createPaginatedResult,
} from '@extractiq/core';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { Database } from '../drizzle/client';
import { documents } from '../drizzle/schema/documents.schema';
import { DocumentMapper } from '../mappers/document.mapper';

export class DrizzleDocumentRepository implements DocumentRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<Document | null> {
    const [row] = await this.db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    return row ? DocumentMapper.toDomain(row) : null;
  }

  async findByTenantId(
    tenantId: string,
    params: PaginationParams
  ): Promise<PaginatedResult<Document>> {
    const offset = (params.page - 1) * params.limit;

    // Get total count
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(documents)
      .where(eq(documents.tenantId, tenantId));

    // Get paginated data
    const rows = await this.db
      .select()
      .from(documents)
      .where(eq(documents.tenantId, tenantId))
      .orderBy(desc(documents.createdAt))
      .limit(params.limit)
      .offset(offset);

    const domainDocuments = DocumentMapper.toDomainList(rows);

    return createPaginatedResult(domainDocuments, count, params);
  }

  async findByStatus(
    tenantId: string,
    status: DocumentStatus,
    params: PaginationParams
  ): Promise<PaginatedResult<Document>> {
    const offset = (params.page - 1) * params.limit;

    // Get total count
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(documents)
      .where(and(eq(documents.tenantId, tenantId), eq(documents.status, status)));

    // Get paginated data
    const rows = await this.db
      .select()
      .from(documents)
      .where(and(eq(documents.tenantId, tenantId), eq(documents.status, status)))
      .orderBy(desc(documents.createdAt))
      .limit(params.limit)
      .offset(offset);

    const domainDocuments = DocumentMapper.toDomainList(rows);

    return createPaginatedResult(domainDocuments, count, params);
  }

  async save(document: Document): Promise<void> {
    const row = DocumentMapper.toPersistence(document);

    await this.db
      .insert(documents)
      .values(row)
      .onConflictDoUpdate({
        target: documents.id,
        set: {
          status: row.status,
          type: row.type,
          extractedData: row.extractedData,
          errorMessage: row.errorMessage,
          updatedAt: row.updatedAt,
        },
      });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(documents).where(eq(documents.id, id));
  }

  async exists(id: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: documents.id })
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    return !!row;
  }

  async countByTenant(tenantId: string): Promise<number> {
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(documents)
      .where(eq(documents.tenantId, tenantId));

    return count;
  }

  async countByStatus(tenantId: string, status: DocumentStatus): Promise<number> {
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(documents)
      .where(and(eq(documents.tenantId, tenantId), eq(documents.status, status)));

    return count;
  }

  async findByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    params: PaginationParams
  ): Promise<PaginatedResult<Document>> {
    const offset = (params.page - 1) * params.limit;

    // Get total count
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(documents)
      .where(
        and(
          eq(documents.tenantId, tenantId),
          gte(documents.createdAt, startDate),
          lte(documents.createdAt, endDate)
        )
      );

    // Get paginated data
    const rows = await this.db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.tenantId, tenantId),
          gte(documents.createdAt, startDate),
          lte(documents.createdAt, endDate)
        )
      )
      .orderBy(desc(documents.createdAt))
      .limit(params.limit)
      .offset(offset);

    const domainDocuments = DocumentMapper.toDomainList(rows);

    return createPaginatedResult(domainDocuments, count, params);
  }
}
