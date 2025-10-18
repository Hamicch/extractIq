import { User } from '../../domain/user/user.entity';
import { UserRole } from '../../domain/user/user.types';
import { UserRepository } from '../../ports/repositories/user.repository';
import { PasswordHasherService } from '../../ports/services/password-hasher.service';
import { Result } from '../../types/result';
import { ConflictError, ValidationError } from '../../types/errors';
import { v4 as uuidv4 } from 'uuid';

export interface RegisterRequest {
  email: string;
  password: string;
  tenantId: string;
  firstName?: string;
  lastName?: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
}

/**
 * Register User Use Case
 * Handles user registration with password hashing
 */
export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasherService
  ) {}

  async execute(request: RegisterRequest): Promise<Result<RegisterResponse, Error>> {
    try {
      // 1. Validate password
      if (request.password.length < 8) {
        return Result.fail(
          new ValidationError('Password must be at least 8 characters', 'password')
        );
      }

      // 2. Check if user already exists
      const existingUser = await this.userRepository.findByEmail(request.email);
      if (existingUser) {
        return Result.fail(new ConflictError('User with this email already exists'));
      }

      // 3. Hash password
      const hashResult = await this.passwordHasher.hash(request.password);
      if (hashResult.isFailure) {
        return Result.fail(hashResult.getError());
      }

      const passwordHash = hashResult.getValue();

      // 4. Create user entity
      const userId = uuidv4();
      const user = User.create(
        userId,
        request.email,
        passwordHash,
        request.tenantId,
        UserRole.USER,
        {
          firstName: request.firstName,
          lastName: request.lastName,
        }
      );

      // 5. Save user
      await this.userRepository.save(user);

      return Result.ok({
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
