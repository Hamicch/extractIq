'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppShell,
  Navigation,
  TenantSwitcher,
  ThemeToggle,
  UserMenu,
} from '@docuflow/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/lib/store';

// Mock tenants - replace with actual API call
const mockTenants = [
  {
    id: '1',
    name: 'Acme Corp',
    slug: 'acme',
    plan: 'pro' as const,
    quotaUsed: 150,
    quotaLimit: 1000,
  },
  {
    id: '2',
    name: 'TechStart Inc',
    slug: 'techstart',
    plan: 'free' as const,
    quotaUsed: 45,
    quotaLimit: 100,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { selectedTenant, setSelectedTenant, sidebarCollapsed, toggleSidebar } =
    useAppStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Set default tenant if none selected
    if (!selectedTenant && mockTenants.length > 0) {
      setSelectedTenant(mockTenants[0]);
    }
  }, [selectedTenant, setSelectedTenant]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AppShell
      sidebarCollapsed={sidebarCollapsed}
      sidebar={
        <Navigation collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      }
      header={
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-4">
            <TenantSwitcher
              tenants={mockTenants}
              selectedTenant={selectedTenant}
              onSelect={setSelectedTenant}
            />
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu
              user={user}
              onSettings={() => router.push('/settings')}
              onLogout={logout}
            />
          </div>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
