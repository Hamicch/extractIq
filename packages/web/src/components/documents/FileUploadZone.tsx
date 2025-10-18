'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@extractiq/ui';

interface FileWithPreview extends File {
  preview?: string;
}

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: FileWithPreview[];
  onRemoveFile: (index: number) => void;
  maxSize?: number;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  disabled?: boolean;
}

export function FileUploadZone({
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  maxSize = 50 * 1024 * 1024, // 50MB
  accept = {
    'application/pdf': ['.pdf'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
  },
  maxFiles = 10,
  disabled = false,
}: FileUploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept,
      maxSize,
      maxFiles,
      disabled,
    });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-neutral-300 dark:border-neutral-700 hover:border-primary/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
        {isDragActive ? (
          <p className="text-lg text-primary font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-lg text-neutral-900 dark:text-neutral-100 font-medium mb-2">
              Drag & drop files here
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              or click to browse
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              Supported: PDF, PNG, JPG • Max size: {formatFileSize(maxSize)} •
              Max files: {maxFiles}
            </p>
          </>
        )}
      </div>

      {fileRejections.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">
            Some files were rejected:
          </p>
          <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                {file.name}: {errors.map((e) => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Selected files ({selectedFiles.length})
          </p>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFile(index)}
                  className="flex-shrink-0"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
