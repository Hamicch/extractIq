import { Result } from '../../types/result';

export interface TokenPayload {
  userId: string;
  email: string;
  tenantId: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Token Service interface (port)
 * Infrastructure layer will implement this with JWT
 */
export interface TokenService {
  /**
   * Generate access token
   */
  generateAccessToken(payload: TokenPayload): Result<string, Error>;

  /**
   * Generate refresh token
   */
  generateRefreshToken(payload: TokenPayload): Result<string, Error>;

  /**
   * Verify and decode token
   */
  verifyToken(token: string): Result<TokenPayload, Error>;

  /**
   * Generate token pair (access + refresh)
   */
  generateTokenPair(payload: TokenPayload): Result<TokenPair, Error>;
}
