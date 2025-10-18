'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client';
import { initializeDocuflowClient } from '@extractiq/shared/api-client';
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Docuflow API client
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const apiKey =
      typeof window !== 'undefined'
        ? localStorage.getItem('docuflow_api_key') || undefined
        : undefined;

    initializeDocuflowClient({
      baseURL: apiUrl,
      apiKey,
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster position="top-right" expand={false} richColors closeButton />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
