import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WebhookDelivery {
  id: string;
  timestamp: string;
  event: string;
  statusCode: number;
  retryCount: number;
  responseTime?: number;
}

interface WebhookDeliveryTableProps {
  deliveries: WebhookDelivery[];
  className?: string;
}

export function WebhookDeliveryTable({
  deliveries,
  className = '',
}: WebhookDeliveryTableProps) {
  const getStatusIcon = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return (
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      );
    }
    if (statusCode >= 500) {
      return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
    }
    return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return 'text-green-600 dark:text-green-400';
    }
    if (statusCode >= 500) {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-yellow-600 dark:text-yellow-400';
  };

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
        No webhook deliveries yet
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead className="border-b border-neutral-200 dark:border-neutral-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
              Event
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
              Retries
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
              Response Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {deliveries.map((delivery) => (
            <tr
              key={delivery.id}
              className="hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <td className="px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100">
                {formatDistanceToNow(new Date(delivery.timestamp), {
                  addSuffix: true,
                })}
              </td>
              <td className="px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 font-mono">
                {delivery.event}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(delivery.statusCode)}
                  <span
                    className={`text-sm font-medium ${getStatusColor(delivery.statusCode)}`}
                  >
                    {delivery.statusCode}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100">
                {delivery.retryCount > 0 && (
                  <div className="flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    <span>{delivery.retryCount}</span>
                  </div>
                )}
                {delivery.retryCount === 0 && (
                  <span className="text-neutral-500">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100">
                {delivery.responseTime ? `${delivery.responseTime}ms` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
