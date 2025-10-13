'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
    );
  }

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currentTheme = themes.find((t) => t.value === theme);
  const Icon = currentTheme?.icon || Sun;

  return (
    <div className="relative group">
      <button
        onClick={() => {
          const nextTheme =
            theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
          setTheme(nextTheme);
        }}
        className={cn(
          'inline-flex items-center justify-center h-9 w-9 rounded-md',
          'bg-neutral-100 dark:bg-neutral-800',
          'hover:bg-neutral-200 dark:hover:bg-neutral-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'transition-colors'
        )}
        aria-label={`Switch to ${currentTheme?.label} theme`}
      >
        <Icon
          className="h-4 w-4 text-neutral-700 dark:text-neutral-300"
          aria-hidden="true"
        />
      </button>

      {/* Tooltip */}
      <div
        className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
          'px-2 py-1 rounded-md',
          'bg-neutral-900 dark:bg-neutral-100',
          'text-xs text-white dark:text-neutral-900 whitespace-nowrap',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity pointer-events-none',
          'z-50'
        )}
        role="tooltip"
      >
        {currentTheme?.label} theme
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
          <div className="border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100" />
        </div>
      </div>
    </div>
  );
}
