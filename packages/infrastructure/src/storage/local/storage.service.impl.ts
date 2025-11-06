import {
  FileStorageService,
  UploadedFile,
  StoredFile,
  Result,
} from '@extractiq/core';
import * as fs from 'fs/promises';
import * as path from 'path';

export class LocalFileStorageService implements FileStorageService {
  private readonly baseDir: string;

  constructor(baseDir: string = './uploads') {
    this.baseDir = baseDir;
  }

  async upload(
    file: UploadedFile,
    tenantId: string,
    documentId: string
  ): Promise<Result<StoredFile, Error>> {
    try {
      // Create directory structure: uploads/{tenantId}/{documentId}/
      const dirPath = path.join(this.baseDir, tenantId, documentId);
      await fs.mkdir(dirPath, { recursive: true });

      // Generate safe filename
      const ext = path.extname(file.originalName);
      const filename = `document${ext}`;
      const filePath = path.join(dirPath, filename);

      // Write file
      await fs.writeFile(filePath, file.buffer);

      return Result.ok({
        filePath,
        size: file.size,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async download(filePath: string): Promise<Result<Buffer, Error>> {
    try {
      const buffer = await fs.readFile(filePath);
      return Result.ok(buffer);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async delete(filePath: string): Promise<Result<void, Error>> {
    try {
      await fs.unlink(filePath);

      // Try to remove empty parent directory
      const dirPath = path.dirname(filePath);
      try {
        await fs.rmdir(dirPath);
      } catch {
        // Ignore error if directory not empty
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async getUrl(filePath: string): Promise<Result<string, Error>> {
    // For local storage, return file:// URL
    const absolutePath = path.resolve(filePath);
    return Result.ok(`file://${absolutePath}`);
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
