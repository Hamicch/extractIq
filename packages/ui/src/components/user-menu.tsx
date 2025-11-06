'use client';

import { useState } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

export interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

export function UserMenu({
  user,
  onProfile,
  onSettings,
  onLogout,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'transition-colors'
        )}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {/* Avatar */}
        <div
          className={cn(
            'flex items-center justify-center h-8 w-8 rounded-full',
            'bg-primary text-primary-foreground text-sm font-medium'
          )}
          aria-hidden="true"
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 text-left hidden md:block">
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {user.name}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {user.email}
          </div>
        </div>

        <ChevronDown
          className={cn(
            'h-4 w-4 text-neutral-500 transition-transform hidden md:block',
            isOpen && 'rotate-180'
          )}
          aria-hidden="true"
        />
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
          <div className="absolute top-full right-0 mt-2 w-56 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg animate-scale-in">
            {/* User Info */}
            <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-700">
              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {user.name}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {user.email}
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-1">
              {onProfile && (
                <button
                  onClick={() => {
                    onProfile();
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-2 rounded-md text-left',
                    'text-sm text-neutral-700 dark:text-neutral-300',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    'transition-colors'
                  )}
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  Profile
                </button>
              )}

              {onSettings && (
                <button
                  onClick={() => {
                    onSettings();
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-2 rounded-md text-left',
                    'text-sm text-neutral-700 dark:text-neutral-300',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    'transition-colors'
                  )}
                >
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  Settings
                </button>
              )}

              {onLogout && (
                <>
                  <div className="my-1 border-t border-neutral-200 dark:border-neutral-700" />
                  <button
                    onClick={() => {
                      onLogout?.();
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-2 rounded-md text-left',
                      'text-sm text-error',
                      'hover:bg-error-50 dark:hover:bg-error-900/20',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      'transition-colors'
                    )}
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
