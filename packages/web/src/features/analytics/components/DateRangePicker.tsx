'use client';

import { useState } from 'react';
import { Button } from '@extractiq/ui';
import { Calendar, ChevronDown } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const presets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

export function DateRangePicker({
  value,
  onChange,
  className = '',
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (days: number) => {
    const to = new Date();
    const from = subDays(to, days);
    onChange({ from, to });
    setIsOpen(false);
  };

  const getActivePreset = () => {
    const daysDiff = Math.round(
      (value.to.getTime() - value.from.getTime()) / (1000 * 60 * 60 * 24)
    );
    const preset = presets.find((p) => p.days === daysDiff);
    return preset?.label || 'Custom range';
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        <span>{getActivePreset()}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-20 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg p-2 min-w-[200px]">
            {presets.map((preset) => (
              <button
                key={preset.days}
                onClick={() => handlePresetClick(preset.days)}
                className="w-full text-left px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm text-neutral-900 dark:text-neutral-100"
              >
                {preset.label}
              </button>
            ))}
            <div className="border-t border-neutral-200 dark:border-neutral-700 my-2" />
            <div className="px-3 py-2 text-xs text-neutral-600 dark:text-neutral-400">
              {format(value.from, 'MMM dd, yyyy')} -{' '}
              {format(value.to, 'MMM dd, yyyy')}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
