'use client';

import { useDocuments } from '@/hooks/api';
import { useAppStore } from '@/lib/store';
import { Card } from '@docuflow/ui';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function DocumentsPage() {
  const selectedTenant = useAppStore((state) => state.selectedTenant);

  const queryParams = {
    limit: 50,
    sortBy: 'uploadedAt' as const,
    sortOrder: 'desc' as const,
  };

  const { data: documentsResponse, isLoading } = useDocuments(queryParams);

  const documents = documentsResponse?.data || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-error" />;
      case 'processing':
      case 'uploaded':
        return <Clock className="h-5 w-5 text-warning animate-spin" />;
      default:
        return <FileText className="h-5 w-5 text-neutral-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Documents
        </h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          View and manage your uploaded documents
        </p>
      </div>

      {documents.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            No documents yet
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Upload your first document to get started
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Upload Document
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Link key={doc.id} href={`/documents/${doc.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(doc.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {doc.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          doc.status === 'completed'
                            ? 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300'
                            : doc.status === 'failed'
                            ? 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300'
                            : 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300'
                        }`}
                      >
                        {getStatusLabel(doc.status)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      {(doc.metadata as any)?.pageCount && ` • ${(doc.metadata as any).pageCount} pages`}
                      {doc.size && ` • ${(doc.size / 1024 / 1024).toFixed(2)} MB`}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
