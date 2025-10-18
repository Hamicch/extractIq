import {
  UserRepository,
  User,
  PaginationParams,
  PaginatedResult,
  createPaginatedResult,
} from '@extractiq/core';
import { eq, sql, desc } from 'drizzle-orm';
import { Database } from '../drizzle/client';
import { users } from '../drizzle/schema/users.schema';
import { UserMapper } from '../mappers/user.mapper';

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return row ? UserMapper.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return row ? UserMapper.toDomain(row) : null;
  }

  async findByTenantId(
    tenantId: string,
    params: PaginationParams
  ): Promise<PaginatedResult<User>> {
    const offset = (params.page - 1) * params.limit;

    // Get total count
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.tenantId, tenantId));

    // Get paginated data
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.tenantId, tenantId))
      .orderBy(desc(users.createdAt))
      .limit(params.limit)
      .offset(offset);

    const domainUsers = UserMapper.toDomainList(rows);

    return createPaginatedResult(domainUsers, count, params);
  }

  async save(user: User): Promise<void> {
    const row = UserMapper.toPersistence(user);

    await this.db
      .insert(users)
      .values(row)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          role: row.role,
          profile: row.profile,
          updatedAt: row.updatedAt,
          lastLoginAt: row.lastLoginAt,
        },
      });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }

  async existsByEmail(email: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return !!row;
  }

  async exists(id: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return !!row;
  }

  async countByTenant(tenantId: string): Promise<number> {
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.tenantId, tenantId));

    return count;
  }
}
