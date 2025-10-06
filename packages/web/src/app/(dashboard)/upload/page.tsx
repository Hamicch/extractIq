'use client';

import { useState, useCallback } from 'react';
import { useUploadDocument as _useUploadDocument } from '@/hooks/api';
import { useAppStore } from '@/lib/store';
import { Card, Button } from '@docuflow/ui';
import { AlertCircle, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FileUploadZone } from '@/components/documents/FileUploadZone';
import * as tus from 'tus-js-client';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const selectedTenant = useAppStore((state) => state.selectedTenant);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const estimateCost = () => {
    const totalPages = selectedFiles.length * 5; // Estimate 5 pages per document
    const costPerPage = 0.01; // $0.01 per page
    return (totalPages * costPerPage).toFixed(2);
  };

  const uploadWithTus = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
        retryDelays: [0, 3000, 5000, 10000],
        metadata: {
          filename: file.name,
          filetype: file.type,
          tenantId: selectedTenant?.id || '',
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('docuflow_api_key')}`,
        },
        onError: (error) => {
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: {
              fileName: file.name,
              progress: 0,
              status: 'error',
              error: error.message,
            },
          }));
          reject(error);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(0);
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: {
              fileName: file.name,
              progress: Number(percentage),
              status: 'uploading',
            },
          }));
        },
        onSuccess: () => {
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: {
              fileName: file.name,
              progress: 100,
              status: 'completed',
            },
          }));
          resolve();
        },
      });

      upload.start();
    });
  };

  const handleUploadAll = async () => {
    if (!selectedTenant || selectedFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Upload files in batches of 3
      const batchSize = 3;
      for (let i = 0; i < selectedFiles.length; i += batchSize) {
        const batch = selectedFiles.slice(i, i + batchSize);
        await Promise.all(batch.map((file) => uploadWithTus(file)));
      }

      toast.success(`Successfully uploaded ${selectedFiles.length} document(s)`);

      // Clear selected files after successful upload
      setTimeout(() => {
        router.push('/documents');
      }, 1500);
    } catch (error) {
      toast.error('Some uploads failed. Please check the status below.');
    } finally {
      setIsUploading(false);
    }
  };

  const _hasErrors = Object.values(uploadProgress).some((p) => p.status === 'error');
  const allCompleted = selectedFiles.length > 0 &&
    Object.keys(uploadProgress).length === selectedFiles.length &&
    Object.values(uploadProgress).every((p) => p.status === 'completed');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Upload Documents
        </h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Upload multiple documents for AI-powered extraction
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <FileUploadZone
            onFilesSelected={handleFilesSelected}
            selectedFiles={selectedFiles}
            onRemoveFile={handleRemoveFile}
            disabled={isUploading}
          />

          {selectedFiles.length > 0 && (
            <div className="mt-6 space-y-4">
              {/* Estimated Cost */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Estimated Processing Cost
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      ${estimateCost()} (based on estimated page count)
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Upload Progress
                  </p>
                  {Object.values(uploadProgress).map((progress) => (
                    <div
                      key={progress.fileName}
                      className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {progress.fileName}
                        </p>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {progress.progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            progress.status === 'error'
                              ? 'bg-red-500'
                              : progress.status === 'completed'
                              ? 'bg-green-500'
                              : 'bg-primary'
                          }`}
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                      {progress.error && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-red-600 dark:text-red-400">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>{progress.error}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleUploadAll}
                  disabled={isUploading || !selectedTenant || selectedFiles.length === 0 || allCompleted}
                  className="flex-1"
                  size="lg"
                >
                  {isUploading
                    ? 'Uploading...'
                    : allCompleted
                    ? 'Upload Complete'
                    : `Upload ${selectedFiles.length} Document${selectedFiles.length > 1 ? 's' : ''}`}
                </Button>

                {allCompleted && (
                  <Button
                    onClick={() => router.push('/documents')}
                    variant="outline"
                    size="lg"
                  >
                    View Documents
                  </Button>
                )}

                {!isUploading && !allCompleted && (
                  <Button
                    onClick={() => {
                      setSelectedFiles([]);
                      setUploadProgress({});
                    }}
                    variant="outline"
                    size="lg"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-neutral-50 dark:bg-neutral-800/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-neutral-500 dark:text-neutral-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              <p className="font-medium mb-1">Processing Information</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Documents are processed in batches of 3 concurrent uploads</li>
                <li>Processing typically takes 1-2 minutes per document</li>
                <li>You can track progress in real-time on the Documents page</li>
                <li>Uploads are resumable - they will continue even if interrupted</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
