import Link from 'next/link';
import { Card } from '@docuflow/ui';
import { FileText, Calendar, File } from 'lucide-react';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { formatDistanceToNow } from 'date-fns';

interface DocumentCardProps {
  document: {
    id: string;
    name: string;
    status: 'uploading' | 'queued' | 'processing' | 'completed' | 'failed';
    uploadedAt: string;
    size: number;
    metadata?: {
      pageCount?: number;
    };
    extraction?: {
      confidence: number;
    };
  };
  showConfidence?: boolean;
}

export function DocumentCard({ document, showConfidence = true }: DocumentCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string) => {
    const ext = filename.split('.').pop()?.toUpperCase();
    return ext || 'FILE';
  };

  return (
    <Link href={`/documents/${document.id}`}>
      <Card className="p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <div className="flex items-start gap-4">
          {/* File Icon */}
          <div className="flex-shrink-0 h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>

          {/* Document Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {document.name}
              </h3>
              <DocumentStatusBadge status={document.status} />
            </div>

            <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1">
                <File className="h-3.5 w-3.5" />
                <span>{formatFileSize(document.size)}</span>
              </div>
              {document.metadata?.pageCount && (
                <span>{document.metadata.pageCount} pages</span>
              )}
            </div>

            {/* Confidence Indicator */}
            {showConfidence && document.extraction?.confidence !== undefined && (
              <div className="mt-2">
                <ConfidenceIndicator
                  confidence={document.extraction.confidence}
                  size="sm"
                  variant="bar"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
