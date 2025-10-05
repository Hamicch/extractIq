'use client';

import { cn } from '../lib/utils';

interface AppShellProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
}

export function AppShell({
  sidebar,
  header,
  children,
  sidebarCollapsed = false,
}: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex-shrink-0 transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
        aria-label="Sidebar navigation"
      >
        {sidebar}
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header
          className="flex-shrink-0 h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
          role="banner"
        >
          {header}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
