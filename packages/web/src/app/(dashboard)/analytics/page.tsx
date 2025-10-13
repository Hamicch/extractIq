'use client';

import { useState, useEffect } from 'react';
import { useAnalytics } from '@/hooks/api';
import { useAppStore } from '@/lib/store';
import { Button } from '@docuflow/ui';
import {
  FileText,
  CheckCircle,
  DollarSign,
  Clock,
  Download,
} from 'lucide-react';
import { MetricCard } from '@/components/analytics/MetricCard';
import {
  AnalyticsChart,
  getChartColors,
} from '@/components/analytics/AnalyticsChart';
import { DateRangePicker } from '@/components/analytics/DateRangePicker';
import { subDays } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from 'next-themes';

export default function AnalyticsPage() {
  const _selectedTenant = useAppStore((state) => state.selectedTenant);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const params = {
    startDate: dateRange.from.toISOString(),
    endDate: dateRange.to.toISOString(),
    granularity: 'day' as const,
  };

  const { data: analytics, isLoading, refetch } = useAnalytics(params);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    console.log('Exporting analytics to CSV...');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mock data for charts - replace with actual API data
  const timeSeriesData = [
    { date: '2024-01-01', documents: 45, cost: 120 },
    { date: '2024-01-02', documents: 52, cost: 145 },
    { date: '2024-01-03', documents: 49, cost: 132 },
    { date: '2024-01-04', documents: 63, cost: 178 },
    { date: '2024-01-05', documents: 58, cost: 165 },
    { date: '2024-01-06', documents: 71, cost: 201 },
    { date: '2024-01-07', documents: 67, cost: 189 },
  ];

  const successFailData = [
    { name: 'Success', value: analytics?.metrics.documentsProcessed || 0 },
    { name: 'Failed', value: 5 },
  ];

  const _costBreakdownData = [
    { stage: 'OCR', cost: 450 },
    { stage: 'Extraction', cost: 680 },
    { stage: 'Validation', cost: 120 },
  ];

  const statusDistribution = [
    { name: 'Completed', value: 65 },
    { name: 'Processing', value: 15 },
    { name: 'Queued', value: 10 },
    { name: 'Failed', value: 10 },
  ];

  const processingTimeData = [
    { percentile: 'p50', time: 45 },
    { percentile: 'p90', time: 89 },
    { percentile: 'p95', time: 124 },
    { percentile: 'p99', time: 201 },
  ];

  const topExpensiveDocs = [
    { name: 'invoice_2024_q1.pdf', pages: 45, cost: 12.5 },
    { name: 'contract_renewal.pdf', pages: 38, cost: 10.8 },
    { name: 'financial_report.pdf', pages: 32, cost: 9.2 },
    { name: 'tax_documents.pdf', pages: 28, cost: 8.1 },
    { name: 'legal_agreement.pdf', pages: 25, cost: 7.3 },
  ];

  const colors = getChartColors(isDark);
  const COLORS = [
    colors.primary,
    colors.secondary,
    colors.tertiary,
    colors.error,
  ];

  // Sparkline data for metric cards
  const sparklineData = timeSeriesData.map((d) => ({ value: d.documents }));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Analytics
          </h1>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            Track your document processing metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Documents"
          value={analytics?.metrics.documentsProcessed || 0}
          icon={FileText}
          trend={{ value: 12.5, isPositive: true }}
          sparklineData={sparklineData}
        />
        <MetricCard
          title="Success Rate"
          value={
            analytics?.metrics.successRate
              ? `${(analytics.metrics.successRate * 100).toFixed(0)}%`
              : '0%'
          }
          icon={CheckCircle}
          trend={{ value: 3.2, isPositive: true }}
          subtitle="Last 30 days"
        />
        <MetricCard
          title="Total Cost"
          value={
            analytics?.metrics.totalCost
              ? `$${(analytics.metrics.totalCost / 100).toFixed(2)}`
              : '$0.00'
          }
          icon={DollarSign}
          trend={{ value: 8.1, isPositive: false }}
        />
        <MetricCard
          title="Avg Processing Time"
          value="1.2m"
          icon={Clock}
          trend={{ value: 0, isPositive: true }}
          subtitle="Median time"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Documents Over Time */}
        <AnalyticsChart
          title="Documents Processed"
          subtitle="Daily document processing volume"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="date" tick={{ fill: colors.text }} />
              <YAxis tick={{ fill: colors.text }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${colors.grid}`,
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="documents"
                stroke={colors.primary}
                strokeWidth={2}
                dot={{ fill: colors.primary }}
              />
            </LineChart>
          </ResponsiveContainer>
        </AnalyticsChart>

        {/* Success vs Failed */}
        <AnalyticsChart
          title="Success vs Failed"
          subtitle="Document processing outcomes"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={successFailData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="name" tick={{ fill: colors.text }} />
              <YAxis tick={{ fill: colors.text }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${colors.grid}`,
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" fill={colors.primary} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsChart>

        {/* Cost Over Time */}
        <AnalyticsChart
          title="Cost Over Time"
          subtitle="Processing costs by stage"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="date" tick={{ fill: colors.text }} />
              <YAxis tick={{ fill: colors.text }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${colors.grid}`,
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="cost"
                stroke={colors.tertiary}
                fill={colors.tertiary}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </AnalyticsChart>

        {/* Status Distribution */}
        <AnalyticsChart
          title="Documents by Status"
          subtitle="Current status distribution"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${colors.grid}`,
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </AnalyticsChart>

        {/* Processing Time Distribution */}
        <AnalyticsChart
          title="Processing Time Distribution"
          subtitle="Percentile breakdown (seconds)"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processingTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="percentile" tick={{ fill: colors.text }} />
              <YAxis tick={{ fill: colors.text }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${colors.grid}`,
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="time" fill={colors.secondary} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsChart>

        {/* Top Expensive Documents */}
        <AnalyticsChart
          title="Top 10 Most Expensive Documents"
          subtitle="By processing cost"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Document
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Pages
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {topExpensiveDocs.map((doc, index) => (
                  <tr
                    key={index}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <td className="px-4 py-2 text-sm text-neutral-900 dark:text-neutral-100 truncate max-w-[200px]">
                      {doc.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-neutral-900 dark:text-neutral-100 text-right">
                      {doc.pages}
                    </td>
                    <td className="px-4 py-2 text-sm text-neutral-900 dark:text-neutral-100 text-right font-medium">
                      ${doc.cost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnalyticsChart>
      </div>
    </div>
  );
}
