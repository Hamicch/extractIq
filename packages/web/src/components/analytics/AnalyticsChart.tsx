'use client';

import { Card } from '@docuflow/ui';
import { useTheme } from 'next-themes';
import { ReactNode } from 'react';

interface AnalyticsChartProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function AnalyticsChart({
  title,
  subtitle,
  children,
  className = '',
}: AnalyticsChartProps) {
  const { theme: _theme } = useTheme();

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      <div className="w-full h-80">{children}</div>
    </Card>
  );
}

// Chart theme configuration
export const getChartColors = (isDark: boolean) => ({
  primary: isDark ? '#60a5fa' : '#3b82f6',
  secondary: isDark ? '#34d399' : '#10b981',
  tertiary: isDark ? '#fbbf24' : '#f59e0b',
  error: isDark ? '#f87171' : '#ef4444',
  text: isDark ? '#e5e7eb' : '#374151',
  grid: isDark ? '#374151' : '#e5e7eb',
});

export const chartConfig = {
  margin: { top: 10, right: 30, left: 0, bottom: 0 },
};
