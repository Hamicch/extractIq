'use client';

import { Card, Button } from '@docuflow/ui';
import { User, Bell, Key, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Settings
        </h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Manage your account and preferences
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Profile Settings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                placeholder="john@example.com"
              />
            </div>

            <Button>Save Changes</Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </h2>

          <div className="space-y-3">
            {[
              'Email notifications for completed documents',
              'Email notifications for failed processing',
              'Weekly summary reports',
            ].map((label) => (
              <label key={label} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </Card>

        {/* API Keys */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </h2>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Manage your API keys for programmatic access
          </p>

          <Button variant="outline">Generate New Key</Button>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <Button>Change Password</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
