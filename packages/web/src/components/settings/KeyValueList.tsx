import { ReactNode } from 'react';

interface KeyValueItem {
  key: string;
  value: string | number | ReactNode;
  copyable?: boolean;
}

interface KeyValueListProps {
  items: KeyValueItem[];
  className?: string;
}

export function KeyValueList({ items, className = '' }: KeyValueListProps) {
  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  return (
    <dl className={`space-y-4 ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700 last:border-0"
        >
          <dt className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {item.key}
          </dt>
          <dd className="text-sm text-neutral-900 dark:text-neutral-100 font-mono flex items-center gap-2">
            {typeof item.value === 'string' || typeof item.value === 'number' ? (
              <>
                <span>{item.value}</span>
                {item.copyable && typeof item.value === 'string' && (
                  <button
                    onClick={() => handleCopy(item.value as string)}
                    className="text-primary hover:text-primary/80 text-xs"
                  >
                    Copy
                  </button>
                )}
              </>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
