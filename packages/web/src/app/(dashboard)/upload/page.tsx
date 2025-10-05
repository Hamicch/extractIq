'use client';

import { useState, useCallback } from 'react';
import { useUploadDocument } from '@/hooks/api';
import { useAppStore } from '@/lib/store';
import { Card, Button } from '@docuflow/ui';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function UploadPage() {
  const router = useRouter();
  const selectedTenant = useAppStore((state) => state.selectedTenant);
  const { mutateAsync: uploadDocument, isPending } = useUploadDocument();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      toast.error('Please upload a PDF file');
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedTenant) return;

    try {
      await uploadDocument({ file });
      toast.success('Document uploaded successfully');
      router.push('/documents');
    } catch (error) {
      toast.error('Failed to upload document');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Upload Document
        </h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Upload a document for AI-powered extraction
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary-50 dark:bg-primary-900/10'
                  : 'border-neutral-300 dark:border-neutral-700'
              }`}
            >
              <Upload
                className={`h-12 w-12 mx-auto mb-4 ${
                  isDragging ? 'text-primary' : 'text-neutral-400'
                }`}
              />

              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Drop your file here
              </h3>

              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                or click to browse
              </p>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileInput}
                  className="hidden"
                  aria-label="Upload file"
                />
                <span className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Select File
                </span>
              </label>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
                Supported formats: PDF (max 50MB)
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-10 w-10 text-primary" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {file.name}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setFile(null)}
                  className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors"
                  aria-label="Remove file"
                >
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>

              <div className="bg-accent-50 dark:bg-accent-900/10 border border-accent-200 dark:border-accent-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-accent-900 dark:text-accent-100 mb-1">
                      Ready to upload
                    </p>
                    <p className="text-accent-700 dark:text-accent-300">
                      Your document will be processed using AI to extract structured data.
                      This typically takes 1-2 minutes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={isPending || !selectedTenant}
                  className="flex-1"
                >
                  {isPending ? 'Uploading...' : 'Upload & Process'}
                </Button>

                <Button
                  onClick={() => setFile(null)}
                  variant="outline"
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
