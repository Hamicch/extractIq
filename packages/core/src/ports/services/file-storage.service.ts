import { Result } from '../../types/result';

export interface UploadedFile {
  originalName: string;
  size: number;
  mimeType: string;
  buffer: Buffer;
}

export interface StoredFile {
  filePath: string;
  url?: string;
  size: number;
}

/**
 * File Storage Service interface (port)
 * Infrastructure layer will implement this (local storage or S3)
 */
export interface FileStorageService {
  /**
   * Upload a file to storage
   */
  upload(
    file: UploadedFile,
    tenantId: string,
    documentId: string
  ): Promise<Result<StoredFile, Error>>;

  /**
   * Download a file from storage
   */
  download(filePath: string): Promise<Result<Buffer, Error>>;

  /**
   * Delete a file from storage
   */
  delete(filePath: string): Promise<Result<void, Error>>;

  /**
   * Get file URL (for direct access)
   */
  getUrl(filePath: string): Promise<Result<string, Error>>;

  /**
   * Check if file exists
   */
  exists(filePath: string): Promise<boolean>;
}
