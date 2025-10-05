'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Building2 } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  quotaUsed: number;
  quotaLimit: number;
}

interface TenantSwitcherProps {
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  onSelect: (tenant: Tenant) => void;
}

export function TenantSwitcher({
  tenants,
  selectedTenant,
  onSelect,
}: TenantSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredTenants = tenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(search.toLowerCase())
  );

  const quotaPercentage = selectedTenant
    ? (selectedTenant.quotaUsed / selectedTenant.quotaLimit) * 100
    : 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 w-full px-3 py-2 rounded-md',
          'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
          'hover:bg-neutral-50 dark:hover:bg-neutral-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'transition-colors'
        )}
        aria-label="Select tenant"
        aria-expanded={isOpen}
      >
        <Building2 className="h-4 w-4 text-neutral-500" aria-hidden="true" />
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {selectedTenant?.name || 'Select workspace'}
          </div>
          {selectedTenant && (
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {selectedTenant.plan.charAt(0).toUpperCase() + selectedTenant.plan.slice(1)} Plan
            </div>
          )}
        </div>
        <ChevronsUpDown className="h-4 w-4 text-neutral-500" aria-hidden="true" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg animate-scale-in">
            {/* Search */}
            <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
              <input
                type="text"
                placeholder="Search workspaces..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-md',
                  'bg-neutral-50 dark:bg-neutral-900',
                  'border border-neutral-200 dark:border-neutral-700',
                  'focus:outline-none focus:ring-2 focus:ring-primary'
                )}
                aria-label="Search workspaces"
              />
            </div>

            {/* Tenant List */}
            <div className="max-h-64 overflow-y-auto p-1">
              {filteredTenants.length === 0 ? (
                <div className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400">
                  No workspaces found
                </div>
              ) : (
                filteredTenants.map((tenant) => {
                  const isSelected = selectedTenant?.id === tenant.id;
                  const usage = (tenant.quotaUsed / tenant.quotaLimit) * 100;

                  return (
                    <button
                      key={tenant.id}
                      onClick={() => {
                        onSelect(tenant);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={cn(
                        'flex items-center gap-2 w-full px-3 py-2 rounded-md text-left',
                        'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        'transition-colors',
                        isSelected && 'bg-neutral-100 dark:bg-neutral-700'
                      )}
                      aria-selected={isSelected}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {tenant.name}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {tenant.quotaUsed.toLocaleString()} / {tenant.quotaLimit.toLocaleString()} docs
                        </div>
                        {/* Quota bar */}
                        <div className="mt-1 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full transition-all',
                              usage > 90
                                ? 'bg-error'
                                : usage > 75
                                ? 'bg-warning'
                                : 'bg-success'
                            )}
                            style={{ width: `${Math.min(usage, 100)}%` }}
                            aria-label={`${usage.toFixed(0)}% quota used`}
                          />
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Quota Summary for Selected */}
            {selectedTenant && (
              <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
                <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Current Usage
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span>{quotaPercentage.toFixed(0)}% of quota</span>
                  <span className={cn(
                    'font-medium',
                    quotaPercentage > 90 ? 'text-error' : quotaPercentage > 75 ? 'text-warning' : 'text-success'
                  )}>
                    {selectedTenant.quotaLimit - selectedTenant.quotaUsed} remaining
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
