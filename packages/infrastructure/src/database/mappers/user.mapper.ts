import { User, UserRole } from '@extractiq/core';
import { UserRow, NewUserRow } from '../drizzle/schema/users.schema';

/**
 * Maps between User domain entity and database row
 */
export class UserMapper {
  /**
   * Convert database row to domain entity
   */
  static toDomain(row: UserRow): User {
    return User.reconstitute(
      row.id,
      row.email,
      row.passwordHash,
      row.tenantId,
      row.role as UserRole,
      (row.profile as any) || {},
      row.createdAt,
      row.updatedAt,
      row.lastLoginAt || undefined
    );
  }

  /**
   * Convert domain entity to database row (for insert/update)
   */
  static toPersistence(user: User): NewUserRow {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      tenantId: user.tenantId,
      role: user.role,
      profile: user.profile as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  /**
   * Convert array of rows to domain entities
   */
  static toDomainList(rows: UserRow[]): User[] {
    return rows.map((row) => this.toDomain(row));
  }
}
