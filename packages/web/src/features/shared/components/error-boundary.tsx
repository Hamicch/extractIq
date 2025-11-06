'use client';

import { Component, ReactNode } from 'react';
import { Card, Button } from '@extractiq/ui';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <Card className="p-8 max-w-lg text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-error mb-4" />
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
            >
              Reload page
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
