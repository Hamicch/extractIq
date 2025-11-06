import { PasswordHasherService, Result } from '@extractiq/core';
import * as bcrypt from 'bcrypt';
import { authConfig } from '../config/auth.config';

export class BcryptPasswordHasherService implements PasswordHasherService {
  private readonly saltRounds: number;

  constructor(saltRounds?: number) {
    this.saltRounds = saltRounds || authConfig.bcrypt.saltRounds;
  }

  async hash(password: string): Promise<Result<string, Error>> {
    try {
      const hash = await bcrypt.hash(password, this.saltRounds);
      return Result.ok(hash);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async compare(password: string, hash: string): Promise<Result<boolean, Error>> {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      return Result.ok(isMatch);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
