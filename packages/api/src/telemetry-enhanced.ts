import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import {
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  trace,
  SpanStatusCode,
} from '@opentelemetry/api';
import type { Span } from '@opentelemetry/api';

// Enable diagnostic logging in development
if (process.env.NODE_ENV === 'development') {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
}

export function setupOpenTelemetryEnhanced() {
  const traceExporter = new OTLPTraceExporter({
    url: process.env.JAEGER_ENDPOINT || 'http://localhost:4318/v1/traces',
  });

  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]:
        process.env.OTEL_SERVICE_NAME || 'docuflow-api',
      [SemanticResourceAttributes.SERVICE_VERSION]:
        process.env.npm_package_version || '0.1.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
        process.env.NODE_ENV || 'development',
    }),
    traceExporter,
  });

  sdk.start();
  console.log('OpenTelemetry initialized with enhanced tracing');

  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('Telemetry terminated'))
      .catch((error) => console.error('Error terminating telemetry', error));
  });
}

// Custom span creation helpers
export function createSpan(
  name: string,
  attributes?: Record<string, any>
): Span {
  const tracer = trace.getTracer(
    process.env.OTEL_SERVICE_NAME || 'docuflow-api'
  );
  const span = tracer.startSpan(name, {
    attributes,
  });
  return span;
}

export async function traceAsyncOperation<T>(
  name: string,
  operation: () => Promise<T>,
  attributes?: Record<string, any>
): Promise<T> {
  const tracer = trace.getTracer(
    process.env.OTEL_SERVICE_NAME || 'docuflow-api'
  );
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      const result = await operation();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}

export function addSpanEvent(name: string, attributes?: Record<string, any>) {
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    activeSpan.addEvent(name, attributes);
  }
}

export function setSpanAttributes(attributes: Record<string, any>) {
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    Object.entries(attributes).forEach(([key, value]) => {
      activeSpan.setAttribute(key, value);
    });
  }
}

// Document processing span helpers
export function createDocumentProcessingSpan(
  stage: string,
  documentId: string,
  tenantId: string
): Span {
  return createSpan(`document.${stage}`, {
    'document.id': documentId,
    'tenant.id': tenantId,
    'document.stage': stage,
  });
}

// OpenAI API call span helper
export function createOpenAISpan(model: string, operation: string): Span {
  return createSpan(`openai.${operation}`, {
    'ai.model': model,
    'ai.operation': operation,
  });
}

export function recordOpenAIMetrics(
  span: Span,
  promptTokens: number,
  completionTokens: number,
  cost: number
) {
  span.setAttributes({
    'ai.prompt_tokens': promptTokens,
    'ai.completion_tokens': completionTokens,
    'ai.total_tokens': promptTokens + completionTokens,
    'ai.cost_dollars': cost,
  });
}
