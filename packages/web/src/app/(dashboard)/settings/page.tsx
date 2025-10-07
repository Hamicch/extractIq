'use client';

import { useState } from 'react';
import { Card, Button, Input } from '@docuflow/ui';
import {
  Building,
  Webhook,
  DollarSign,
  Settings as SettingsIcon,
  Key,
  Trash2,
  Copy,
  Plus,
  Send,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { KeyValueList } from '@/components/settings/KeyValueList';
import { WebhookDeliveryTable } from '@/components/settings/WebhookDeliveryTable';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

type TabType = 'tenant' | 'webhooks' | 'billing' | 'preferences';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('tenant');
  const selectedTenant = useAppStore((state) => state.selectedTenant);
  const { theme, setTheme } = useTheme();

  const tabs = [
    { id: 'tenant' as TabType, label: 'Tenant Settings', icon: Building },
    { id: 'webhooks' as TabType, label: 'Webhooks', icon: Webhook },
    { id: 'billing' as TabType, label: 'Billing', icon: DollarSign },
    { id: 'preferences' as TabType, label: 'Preferences', icon: SettingsIcon },
  ];

  // Mock data - replace with actual API data
  const apiKeys = [
    { id: '1', name: 'Production Key', key: 'sk_live_••••••••••••••••', createdAt: '2024-01-15' },
    { id: '2', name: 'Development Key', key: 'sk_test_••••••••••••••••', createdAt: '2024-01-10' },
  ];

  const webhookDeliveries = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      event: 'document.completed',
      statusCode: 200,
      retryCount: 0,
      responseTime: 145,
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      event: 'document.failed',
      statusCode: 500,
      retryCount: 2,
      responseTime: 3200,
    },
  ];

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  const handleGenerateApiKey = () => {
    // TODO: Implement API key generation
    toast.success('New API key generated');
  };

  const handleRevokeApiKey = (_id: string) => {
    // TODO: Implement API key revocation
    toast.success('API key revoked');
  };

  const handleTestWebhook = () => {
    // TODO: Implement webhook testing
    toast.success('Test webhook sent');
  };

  const handleDeleteTenant = () => {
    // TODO: Implement tenant deletion with confirmation
    toast.error('Tenant deletion requires confirmation');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Settings
        </h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Manage your tenant configuration and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6">
        <div className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl">
        {activeTab === 'tenant' && (
          <div className="space-y-6">
            {/* Tenant Info */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Tenant Information
              </h2>
              <KeyValueList
                items={[
                  { key: 'Tenant Name', value: selectedTenant?.name || 'N/A' },
                  { key: 'Tenant ID', value: selectedTenant?.id || 'N/A', copyable: true },
                  { key: 'Created', value: new Date(selectedTenant?.createdAt || Date.now()).toLocaleDateString() },
                  { key: 'Plan', value: selectedTenant?.plan || 'free' },
                ]}
              />
            </Card>

            {/* API Keys */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  API Keys
                </h2>
                <Button size="sm" onClick={handleGenerateApiKey} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Generate Key
                </Button>
              </div>

              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Key className="h-4 w-4 text-neutral-500" />
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {key.name}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                            {key.key}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 ml-7">
                        Created {key.createdAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyApiKey(key.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeApiKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Rate Limits & Quota */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Usage & Limits
              </h2>

              <div className="space-y-4">
                {/* Rate Limit */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Requests This Hour
                    </span>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      45 / 1000
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: '4.5%' }}
                    />
                  </div>
                </div>

                {/* Monthly Quota */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Pages This Month
                    </span>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      1,250 / 10,000
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: '12.5%' }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Resets on Feb 1, 2024
                  </p>
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 border-red-200 dark:border-red-800">
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                Danger Zone
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Once you delete a tenant, there is no going back. All documents, API keys, and data will be permanently deleted.
              </p>
              <Button variant="destructive" onClick={handleDeleteTenant}>
                Delete Tenant
              </Button>
            </Card>
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            {/* Webhook Configuration */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Webhook Configuration
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Webhook URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://your-domain.com/webhook"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Events
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'document.completed', label: 'Document Processing Completed' },
                      { id: 'document.failed', label: 'Document Processing Failed' },
                      { id: 'document.uploaded', label: 'Document Uploaded' },
                      { id: 'document.deleted', label: 'Document Deleted' },
                    ].map((event) => (
                      <label key={event.id} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700"
                          defaultChecked
                        />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                          {event.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Secret Key
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value="whsec_••••••••••••••••••••••••"
                      readOnly
                      className="flex-1"
                    />
                    <Button variant="outline">Regenerate</Button>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Use this secret to verify webhook signatures
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button>Save Configuration</Button>
                  <Button variant="outline" onClick={handleTestWebhook} className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Test Webhook
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent Deliveries */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Recent Deliveries
              </h2>
              <WebhookDeliveryTable deliveries={webhookDeliveries} />
            </Card>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Current Month Cost */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Current Month
              </h2>
              <div className="mb-6">
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  $45.82
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Billing period: Jan 1 - Jan 31, 2024
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">OCR Processing</span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">$18.50</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Data Extraction</span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">$22.32</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Validation</span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">$5.00</span>
                </div>
              </div>
            </Card>

            {/* Invoices */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Invoices
              </h2>
              <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                <p>Invoice history coming soon</p>
                <Button variant="outline" className="mt-4">
                  View Invoices
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            {/* Theme */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Appearance
              </h2>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'system', label: 'System', icon: Monitor },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                          theme === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Notifications */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Notifications
              </h2>
              <div className="space-y-3">
                {[
                  { id: 'email-completed', label: 'Email when documents complete processing' },
                  { id: 'email-failed', label: 'Email when processing fails' },
                  { id: 'weekly-summary', label: 'Weekly analytics summary' },
                  { id: 'quota-warnings', label: 'Quota usage warnings' },
                ].map((option) => (
                  <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700"
                      defaultChecked
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </Card>

            {/* Default Upload Settings */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Default Upload Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Default Language
                  </label>
                  <select className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700"
                      defaultChecked
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      Auto-process documents after upload
                    </span>
                  </label>
                </div>

                <Button>Save Preferences</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
