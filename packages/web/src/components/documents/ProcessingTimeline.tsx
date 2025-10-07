import { CheckCircle, Circle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TimelineEvent {
  id: string;
  stage: 'upload' | 'ocr' | 'extract' | 'validate';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp?: string;
  message?: string;
  error?: string;
}

interface ProcessingTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const stageLabels = {
  upload: 'Document Upload',
  ocr: 'OCR Processing',
  extract: 'Data Extraction',
  validate: 'Validation',
};

export function ProcessingTimeline({ events, className = '' }: ProcessingTimelineProps) {
  const getStatusIcon = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'pending':
        return <Circle className="h-5 w-5 text-neutral-300 dark:text-neutral-600" />;
    }
  };

  // Helper function for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'processing':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-neutral-300 dark:bg-neutral-600';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="relative">
            {/* Connector line */}
            {!isLast && (
              <div
                className={`absolute left-2.5 top-8 w-0.5 h-full ${
                  event.status === 'completed'
                    ? 'bg-green-500'
                    : 'bg-neutral-200 dark:bg-neutral-700'
                }`}
              />
            )}

            <div className="flex gap-4">
              {/* Status Icon */}
              <div className="relative flex-shrink-0 pt-1">
                {getStatusIcon(event.status)}
              </div>

              {/* Event Details */}
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {stageLabels[event.stage]}
                    </h4>
                    {event.timestamp && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      event.status === 'completed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : event.status === 'failed'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        : event.status === 'processing'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    {event.status}
                  </div>
                </div>

                {/* Message or Error */}
                {event.message && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                    {event.message}
                  </p>
                )}
                {event.error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-2">
                    <p className="text-sm text-red-700 dark:text-red-400">{event.error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
