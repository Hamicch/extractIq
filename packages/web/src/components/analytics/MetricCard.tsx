import { Card } from '@extractiq/ui';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  sparklineData?: Array<{ value: number }>;
  subtitle?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  sparklineData,
  subtitle,
  className = '',
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;

    if (trend.value === 0) {
      return <Minus className="h-4 w-4 text-neutral-500" />;
    }

    return trend.isPositive ? (
      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
    );
  };

  const getTrendColor = () => {
    if (!trend || trend.value === 0)
      return 'text-neutral-600 dark:text-neutral-400';
    return trend.isPositive
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {trend && (
            <>
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-500">
                vs last period
              </span>
            </>
          )}
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="w-24 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
}
