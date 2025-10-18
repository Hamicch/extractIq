import { Badge } from '@extractiq/ui';
import { Clock, CheckCircle, XCircle, Upload, Loader } from 'lucide-react';

type DocumentStatus =
  | 'uploading'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

const statusConfig = {
  uploading: {
    label: 'Uploading',
    icon: Upload,
    className:
      'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  },
  queued: {
    label: 'Queued',
    icon: Loader,
    className:
      'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  },
  processing: {
    label: 'Processing',
    icon: Clock,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    className:
      'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  },
};

export function DocumentStatusBadge({
  status,
  className = '',
}: DocumentStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      className={`inline-flex items-center gap-1.5 ${config.className} ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </Badge>
  );
}
