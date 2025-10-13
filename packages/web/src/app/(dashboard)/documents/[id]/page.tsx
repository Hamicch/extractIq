'use client';

import { use, useState } from 'react';
import { useDocument, useExtractedData } from '@/hooks/api';
import { Card, Button } from '@docuflow/ui';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Database,
  Activity,
  Code,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { DocumentStatusBadge } from '@/components/documents/DocumentStatusBadge';
import { ConfidenceIndicator } from '@/components/documents/ConfidenceIndicator';
import { ProcessingTimeline } from '@/components/documents/ProcessingTimeline';
import { useWebSocket } from '@/hooks/useWebSocket';

type TabType = 'overview' | 'extracted' | 'audit' | 'raw';

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { data: document, isLoading: docLoading, refetch } = useDocument(id);
  const { data: extraction, isLoading: extractionLoading } =
    useExtractedData(id);

  // WebSocket for real-time updates
  useWebSocket({
    onDocumentUpdate: (data) => {
      if (data.documentId === id) {
        refetch();
      }
    },
  });

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

  // Mock timeline events - replace with actual data from API
  const timelineEvents = [
    {
      id: '1',
      stage: 'upload' as const,
      status: 'completed' as const,
      timestamp: document.uploadedAt,
      message: 'Document uploaded successfully',
    },
    {
      id: '2',
      stage: 'ocr' as const,
      status:
        document.status === 'completed'
          ? ('completed' as const)
          : document.status === 'processing'
            ? ('processing' as const)
            : ('pending' as const),
      timestamp: document.processedAt || undefined,
      message:
        document.status === 'completed'
          ? 'OCR processing completed'
          : undefined,
    },
    {
      id: '3',
      stage: 'extract' as const,
      status: extraction
        ? ('completed' as const)
        : document.status === 'processing'
          ? ('processing' as const)
          : ('pending' as const),
      timestamp: extraction?.extractedAt || undefined,
      message: extraction ? 'Data extraction completed' : undefined,
    },
    {
      id: '4',
      stage: 'validate' as const,
      status:
        document.status === 'completed'
          ? ('completed' as const)
          : ('pending' as const),
      timestamp: document.processedAt || undefined,
    },
  ];

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: FileText },
    { id: 'extracted' as TabType, label: 'Extracted Data', icon: Database },
    { id: 'audit' as TabType, label: 'Audit Log', icon: Activity },
    { id: 'raw' as TabType, label: 'Raw Data', icon: Code },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/documents"
          className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to documents
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              {document.name}
            </h1>
            <div className="flex items-center gap-3">
              <DocumentStatusBadge status={document.status} />
              {extraction && (
                <ConfidenceIndicator
                  confidence={extraction.confidence}
                  size="sm"
                  variant="dot"
                />
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6">
        <div className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Document Info */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Info
              </h2>

              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-neutral-500 dark:text-neutral-400">
                    Status
                  </dt>
                  <dd className="mt-1">
                    <DocumentStatusBadge status={document.status} />
                  </dd>
                </div>

                <div>
                  <dt className="text-neutral-500 dark:text-neutral-400">
                    File Size
                  </dt>
                  <dd className="mt-1 text-neutral-900 dark:text-neutral-100">
                    {(document.size / 1024 / 1024).toFixed(2)} MB
                  </dd>
                </div>

                <div>
                  <dt className="text-neutral-500 dark:text-neutral-400">
                    Pages
                  </dt>
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
                    <dt className="text-neutral-500 dark:text-neutral-400">
                      Processed
                    </dt>
                    <dd className="mt-1 text-neutral-900 dark:text-neutral-100">
                      {new Date(document.processedAt).toLocaleString()}
                    </dd>
                  </div>
                )}

                {extraction && (
                  <div>
                    <dt className="text-neutral-500 dark:text-neutral-400">
                      Confidence
                    </dt>
                    <dd className="mt-2">
                      <ConfidenceIndicator
                        confidence={extraction.confidence}
                        size="md"
                        variant="bar"
                      />
                    </dd>
                  </div>
                )}
              </dl>
            </Card>

            {/* Processing Timeline */}
            <Card className="lg:col-span-2 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Processing Timeline
              </h2>
              <ProcessingTimeline events={timelineEvents} />
            </Card>
          </div>
        )}

        {activeTab === 'extracted' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Extracted Data
            </h2>

            {extractionLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-neutral-200 dark:bg-neutral-800 rounded"
                  />
                ))}
              </div>
            ) : extraction ? (
              <div className="space-y-4">
                {/* Editable Fields */}
                <div className="space-y-3">
                  {Object.entries(extraction.fields || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                              {key
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </label>
                            <p className="text-neutral-900 dark:text-neutral-100">
                              {typeof value === 'object'
                                ? JSON.stringify(value, null, 2)
                                : String(value)}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    Extracted:{' '}
                    {new Date(extraction.extractedAt).toLocaleString()}
                  </div>
                  <ConfidenceIndicator
                    confidence={extraction.confidence}
                    size="sm"
                    variant="bar"
                    className="w-48"
                  />
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
        )}

        {activeTab === 'audit' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Audit Log
            </h2>
            <ProcessingTimeline events={timelineEvents} />
          </Card>
        )}

        {activeTab === 'raw' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
              <Code className="h-5 w-5" />
              Raw Data
            </h2>
            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-neutral-900 dark:text-neutral-100">
                {JSON.stringify(
                  {
                    document,
                    extraction,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
