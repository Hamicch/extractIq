import { Result } from '../../types/result';

/**
 * Password Hasher Service interface (port)
 * Infrastructure layer will implement this with bcrypt
 */
export interface PasswordHasherService {
  /**
   * Hash a plain text password
   */
  hash(password: string): Promise<Result<string, Error>>;

  /**
   * Compare a plain text password with a hash
   */
  compare(password: string, hash: string): Promise<Result<boolean, Error>>;
}
