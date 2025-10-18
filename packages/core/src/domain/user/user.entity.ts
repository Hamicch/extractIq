import { BaseEntity } from '../shared/base-entity';
import { UserRole, UserProfile } from './user.types';
import { ValidationError } from '../../types/errors';

export class User extends BaseEntity {
  private constructor(
    id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly tenantId: string,
    public role: UserRole,
    public profile: UserProfile,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public lastLoginAt?: Date
  ) {
    super(id);
    this.validateEmail(email);
  }

  public static create(
    id: string,
    email: string,
    passwordHash: string,
    tenantId: string,
    role: UserRole = UserRole.USER,
    profile: UserProfile = {}
  ): User {
    return new User(id, email, passwordHash, tenantId, role, profile);
  }

  public static reconstitute(
    id: string,
    email: string,
    passwordHash: string,
    tenantId: string,
    role: UserRole,
    profile: UserProfile,
    createdAt: Date,
    updatedAt: Date,
    lastLoginAt?: Date
  ): User {
    return new User(
      id,
      email,
      passwordHash,
      tenantId,
      role,
      profile,
      createdAt,
      updatedAt,
      lastLoginAt
    );
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format', 'email');
    }
  }

  public updateProfile(profile: Partial<UserProfile>): void {
    this.profile = { ...this.profile, ...profile };
    this.updatedAt = new Date();
  }

  public updateRole(role: UserRole): void {
    this.role = role;
    this.updatedAt = new Date();
  }

  public recordLogin(): void {
    this.lastLoginAt = new Date();
    this.updatedAt = new Date();
  }

  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  public getFullName(): string | undefined {
    if (this.profile.firstName && this.profile.lastName) {
      return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return this.profile.firstName || this.profile.lastName;
  }
}
