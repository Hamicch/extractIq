import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';

export interface AnalyticsEvent {
  name: string;
  value?: number;
  label?: string;
  metadata?: Record<string, any>;
}

// Send analytics to your backend or analytics service
async function sendToAnalytics(event: AnalyticsEvent) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  try {
    await fetch(`${apiUrl}/api/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...event,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
      // Don't wait for response, fire and forget
      keepalive: true,
    });
  } catch (error) {
    // Silently fail - don't break user experience
    console.error('Failed to send analytics:', error);
  }
}

// Web Vitals tracking
export function initWebVitals() {
  function sendWebVital(metric: Metric) {
    sendToAnalytics({
      name: metric.name,
      value: metric.value,
      label: metric.rating,
      metadata: {
        id: metric.id,
        navigationType: metric.navigationType,
      },
    });
  }

  // Core Web Vitals
  onCLS(sendWebVital); // Cumulative Layout Shift
  onLCP(sendWebVital); // Largest Contentful Paint
  onINP(sendWebVital); // Interaction to Next Paint (replaces FID)

  // Other important metrics
  onFCP(sendWebVital); // First Contentful Paint
  onTTFB(sendWebVital); // Time to First Byte
}

// Custom event tracking
export function trackEvent(name: string, metadata?: Record<string, any>) {
  sendToAnalytics({
    name,
    metadata,
  });
}

// Page view tracking
export function trackPageView(page: string) {
  sendToAnalytics({
    name: 'page_view',
    metadata: {
      page,
      referrer: document.referrer,
    },
  });
}

// Document upload tracking
export function trackDocumentUpload(
  status: 'started' | 'completed' | 'failed',
  metadata?: Record<string, any>
) {
  sendToAnalytics({
    name: `document_upload_${status}`,
    metadata,
  });
}

// API call tracking
export function trackApiCall(
  endpoint: string,
  method: string,
  duration: number,
  status: number
) {
  sendToAnalytics({
    name: 'api_call',
    value: duration,
    metadata: {
      endpoint,
      method,
      status,
    },
  });
}

// Feature usage tracking
export function trackFeatureUsage(
  feature: string,
  action: string,
  metadata?: Record<string, any>
) {
  sendToAnalytics({
    name: 'feature_usage',
    metadata: {
      feature,
      action,
      ...metadata,
    },
  });
}

// Error tracking
export interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  errorBoundary?: string;
}

export function trackError(error: ErrorInfo) {
  sendToAnalytics({
    name: 'error',
    metadata: {
      ...error,
      url: window.location.href,
    },
  });
}

// Performance timing tracking
export function trackPerformance(
  name: string,
  duration: number,
  metadata?: Record<string, any>
) {
  sendToAnalytics({
    name: 'performance',
    value: duration,
    metadata: {
      metric: name,
      ...metadata,
    },
  });
}

// Initialize analytics on app load
if (typeof window !== 'undefined') {
  // Track initial page load
  window.addEventListener('load', () => {
    trackPageView(window.location.pathname);
    initWebVitals();
  });

  // Global error handler
  window.addEventListener('error', (event) => {
    trackError({
      message: event.message,
      stack: event.error?.stack,
    });
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    trackError({
      message: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack,
    });
  });
}
