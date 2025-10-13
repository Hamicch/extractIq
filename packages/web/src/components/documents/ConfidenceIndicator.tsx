interface ConfidenceIndicatorProps {
  confidence: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'bar' | 'dot';
  className?: string;
}

export function ConfidenceIndicator({
  confidence,
  showLabel = true,
  size = 'md',
  variant = 'bar',
  className = '',
}: ConfidenceIndicatorProps) {
  const percentage = Math.round(confidence * 100);

  const getColorClass = () => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColorClass = () => {
    if (percentage >= 90) return 'text-green-700 dark:text-green-400';
    if (percentage >= 70) return 'text-yellow-700 dark:text-yellow-400';
    return 'text-red-700 dark:text-red-400';
  };

  const sizeClasses = {
    sm: { height: 'h-1.5', dot: 'h-2 w-2', text: 'text-xs' },
    md: { height: 'h-2', dot: 'h-3 w-3', text: 'text-sm' },
    lg: { height: 'h-3', dot: 'h-4 w-4', text: 'text-base' },
  };

  if (variant === 'dot') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div
          className={`rounded-full ${getColorClass()} ${sizeClasses[size].dot}`}
          title={`${percentage}% confidence`}
        />
        {showLabel && (
          <span
            className={`font-medium ${getTextColorClass()} ${sizeClasses[size].text}`}
          >
            {percentage}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full ${sizeClasses[size].height} overflow-hidden`}
      >
        <div
          className={`${getColorClass()} ${sizeClasses[size].height} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span
          className={`font-medium ${getTextColorClass()} ${sizeClasses[size].text} min-w-[3rem] text-right`}
        >
          {percentage}%
        </span>
      )}
    </div>
  );
}
