import { TokenService, TokenPayload, TokenPair, Result } from '@extractiq/core';
import * as jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.config';

function validateSecret(secret: string): void {
    if (!secret || secret.trim().length === 0) {
        throw new Error('JWT secret cannot be empty');
    }
    if (secret.length < 32) {
        throw new Error(`JWT secret must be at least 32 characters long. Current length: ${secret.length}`);
    }
}

export class JwtTokenService implements TokenService {
    private readonly secret: string;
    private readonly accessTokenExpiry: string;
    private readonly refreshTokenExpiry: string;

    constructor(secret?: string, accessTokenExpiry?: string, refreshTokenExpiry?: string) {
      const finalSecret = secret || authConfig.jwt.secret;
      validateSecret(finalSecret);

      this.secret = finalSecret;
    this.accessTokenExpiry = accessTokenExpiry || authConfig.jwt.accessTokenExpiry;
    this.refreshTokenExpiry = refreshTokenExpiry || authConfig.jwt.refreshTokenExpiry;
  }

  generateAccessToken(payload: TokenPayload): Result<string, Error> {
    try {
      const token = jwt.sign(payload, this.secret, {
        expiresIn: this.accessTokenExpiry,
      } as jwt.SignOptions);
      return Result.ok(token);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  generateRefreshToken(payload: TokenPayload): Result<string, Error> {
    try {
      const token = jwt.sign(payload, this.secret, {
        expiresIn: this.refreshTokenExpiry,
      } as jwt.SignOptions);
      return Result.ok(token);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  verifyToken(token: string): Result<TokenPayload, Error> {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return Result.ok(decoded);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  generateTokenPair(payload: TokenPayload): Result<TokenPair, Error> {
    try {
      const accessTokenResult = this.generateAccessToken(payload);
      const refreshTokenResult = this.generateRefreshToken(payload);

      if (accessTokenResult.isFailure) {
        return Result.fail(accessTokenResult.getError());
      }

      if (refreshTokenResult.isFailure) {
        return Result.fail(refreshTokenResult.getError());
      }

      return Result.ok({
        accessToken: accessTokenResult.getValue(),
        refreshToken: refreshTokenResult.getValue(),
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
