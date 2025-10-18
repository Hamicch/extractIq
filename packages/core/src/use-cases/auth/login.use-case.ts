import { UserRepository } from '../../ports/repositories/user.repository';
import { PasswordHasherService } from '../../ports/services/password-hasher.service';
import { TokenService, TokenPair } from '../../ports/services/token.service';
import { Result } from '../../types/result';
import { UnauthorizedError } from '../../types/errors';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    tenantId: string;
    role: string;
    fullName?: string;
  };
}

/**
 * Login Use Case
 * Handles user authentication and token generation
 */
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly tokenService: TokenService
  ) {}

  async execute(request: LoginRequest): Promise<Result<LoginResponse, Error>> {
    try {
      // 1. Find user by email
      const user = await this.userRepository.findByEmail(request.email);
      if (!user) {
        return Result.fail(new UnauthorizedError('Invalid email or password'));
      }

      // 2. Verify password
      const passwordResult = await this.passwordHasher.compare(
        request.password,
        user.passwordHash
      );

      if (passwordResult.isFailure || !passwordResult.getValue()) {
        return Result.fail(new UnauthorizedError('Invalid email or password'));
      }

      // 3. Generate tokens
      const tokenResult = this.tokenService.generateTokenPair({
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      });

      if (tokenResult.isFailure) {
        return Result.fail(tokenResult.getError());
      }

      const tokens = tokenResult.getValue();

      // 4. Record login
      user.recordLogin();
      await this.userRepository.save(user);

      return Result.ok({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          tenantId: user.tenantId,
          role: user.role,
          fullName: user.getFullName(),
        },
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
