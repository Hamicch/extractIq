import { User } from '../../domain/user/user.entity';
import { PaginationParams, PaginatedResult } from '../../types/pagination';

/**
 * User repository interface (port)
 */
export interface UserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find users by tenant ID
   */
  findByTenantId(
    tenantId: string,
    params: PaginationParams
  ): Promise<PaginatedResult<User>>;

  /**
   * Save user (create or update)
   */
  save(user: User): Promise<void>;

  /**
   * Delete user by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Check if user exists by email
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Check if user exists by ID
   */
  exists(id: string): Promise<boolean>;

  /**
   * Count users by tenant
   */
  countByTenant(tenantId: string): Promise<number>;
}
