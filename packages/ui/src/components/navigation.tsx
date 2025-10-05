'use client';

import { cn } from '../lib/utils';
import {
  FileText,
  Upload,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavigationProps {
  items?: NavigationItem[];
  collapsed?: boolean;
  onToggle?: () => void;
}

const defaultItems: NavigationItem[] = [
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Upload', href: '/upload', icon: Upload },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Navigation({
  items = defaultItems,
  collapsed = false,
  onToggle,
}: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
      <div className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {items.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-neutral-700 dark:text-neutral-300'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span
                          className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-accent text-accent-foreground"
                          aria-label={`${item.badge} new items`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {onToggle && (
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={onToggle}
            className={cn(
              'flex items-center justify-center w-full px-3 py-2 rounded-md text-sm font-medium',
              'text-neutral-700 dark:text-neutral-300',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              'transition-colors'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5 mr-2" aria-hidden="true" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      )}
    </nav>
  );
}
