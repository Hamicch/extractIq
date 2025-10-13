'use client';

import { useEffect } from 'react';
import { Button, Card } from '@docuflow/ui';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6">
      <Card className="p-8 max-w-lg text-center">
        <AlertTriangle
          className="h-12 w-12 mx-auto text-error mb-4"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          Something went wrong
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
          >
            Go home
          </Button>
        </div>
      </Card>
    </div>
  );
}
