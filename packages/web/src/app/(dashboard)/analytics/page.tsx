'use client';

import { useAnalytics } from '@/hooks/api';
import { useAppStore } from '@/lib/store';
import { Card } from '@docuflow/ui';
import { FileText, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const selectedTenant = useAppStore((state) => state.selectedTenant);

  // Pass proper parameters for analytics
  const params = {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    granularity: 'day' as const,
  };

  const { data: analytics, isLoading } = useAnalytics(params);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Documents Processed',
      value: analytics?.metrics.documentsProcessed || 0,
      icon: FileText,
      color: 'text-primary',
    },
    {
      label: 'Success Rate',
      value: analytics?.metrics.successRate ? `${(analytics.metrics.successRate * 100).toFixed(0)}%` : '0%',
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      label: 'Total Pages',
      value: analytics?.metrics.totalPages || 0,
      icon: Clock,
      color: 'text-warning',
    },
    {
      label: 'Total Cost',
      value: analytics?.metrics.totalCost ? `$${(analytics.metrics.totalCost / 100).toFixed(2)}` : '$0.00',
      icon: XCircle,
      color: 'text-error',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Analytics
        </h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Track your document processing metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                    {stat.value}
                  </p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Processing Trends
          </h2>
          <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
            Chart coming soon
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Recent Activity
          </h2>
          <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
            Activity feed coming soon
          </div>
        </Card>
      </div>
    </div>
  );
}
