'use client';

import { use } from 'react';
import { useDocument, useExtractedData } from '@/hooks/api';
import { Card } from '@docuflow/ui';
import { ArrowLeft, FileText, Calendar, Database } from 'lucide-react';
import Link from 'next/link';

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: document, isLoading: docLoading } = useDocument(id);
  const { data: extraction, isLoading: extractionLoading } = useExtractedData(id);

  if (docLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Document not found
          </h3>
          <Link
            href="/documents"
            className="inline-flex items-center text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to documents
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/documents"
          className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to documents
        </Link>

        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {document.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Info */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Info
            </h2>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-neutral-500 dark:text-neutral-400">Status</dt>
                <dd className="mt-1 text-neutral-900 dark:text-neutral-100 font-medium">
                  {document.status}
                </dd>
              </div>

              <div>
                <dt className="text-neutral-500 dark:text-neutral-400">File Size</dt>
                <dd className="mt-1 text-neutral-900 dark:text-neutral-100">
                  {(document.size / 1024 / 1024).toFixed(2)} MB
                </dd>
              </div>

              <div>
                <dt className="text-neutral-500 dark:text-neutral-400">Pages</dt>
                <dd className="mt-1 text-neutral-900 dark:text-neutral-100">
                  {(document.metadata as any)?.pageCount || 'N/A'}
                </dd>
              </div>

              <div>
                <dt className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Uploaded
                </dt>
                <dd className="mt-1 text-neutral-900 dark:text-neutral-100">
                  {new Date(document.uploadedAt).toLocaleString()}
                </dd>
              </div>

              {document.processedAt && (
                <div>
                  <dt className="text-neutral-500 dark:text-neutral-400">Processed</dt>
                  <dd className="mt-1 text-neutral-900 dark:text-neutral-100">
                    {new Date(document.processedAt).toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </Card>
        </div>

        {/* Extracted Data */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Extracted Data
            </h2>

            {extractionLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-neutral-200 dark:bg-neutral-800 rounded" />
                ))}
              </div>
            ) : extraction ? (
              <div className="space-y-4">
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                  <pre className="text-sm text-neutral-900 dark:text-neutral-100 overflow-x-auto">
                    {JSON.stringify(extraction.fields, null, 2)}
                  </pre>
                </div>

                <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                  <span>
                    Confidence: {(extraction.confidence * 100).toFixed(0)}%
                  </span>
                  <span>Extracted: {new Date(extraction.extractedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Database className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400">
                  {document.status === 'processing'
                    ? 'Extraction in progress...'
                    : document.status === 'failed'
                    ? 'Extraction failed'
                    : 'No extracted data available'}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
