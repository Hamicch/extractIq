# CI/CD Pipeline and Observability Guide

## Overview

Complete CI/CD pipeline with GitHub Actions workflows, Docker deployment, Kubernetes support, and comprehensive observability using OpenTelemetry, Prometheus, and Grafana.

---

## 📋 Table of Contents

1. [CI/CD Workflows](#cicd-workflows)
2. [Docker Deployment](#docker-deployment)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Observability](#observability)
5. [Metrics](#metrics)
6. [Dashboards](#dashboards)
7. [Alerting](#alerting)

---

## CI/CD Workflows

### 1. Test Workflow (`.github/workflows/test.yml`)

**Triggers:** Pull requests and pushes to main/develop

**Jobs:**
- **backend-tests**: Run API and Worker unit tests
- **frontend-tests**: Run Web component tests
- **e2e-tests**: Run Playwright end-to-end tests
- **type-check**: TypeScript compilation check
- **lint**: ESLint and code quality checks
- **coverage-check**: Enforce coverage thresholds
  - Backend: ≥80%
  - Frontend: ≥70%
- **build-check**: Verify all packages build successfully

**Service Containers:**
- PostgreSQL 15
- Redis 7

### 2. Build Workflow (`.github/workflows/build.yml`)

**Triggers:** Pushes to main branch

**Features:**
- Multi-stage Docker builds for api, worker, and web
- Images tagged with git SHA and `latest`
- Pushed to GitHub Container Registry (ghcr.io)
- Trivy vulnerability scanning
- Security scan results uploaded to GitHub Security

**Images Built:**
- `ghcr.io/{owner}/docuflow-api:{tag}`
- `ghcr.io/{owner}/docuflow-worker:{tag}`
- `ghcr.io/{owner}/docuflow-web:{tag}`

### 3. Deploy Workflow (`.github/workflows/deploy.yml`)

**Trigger:** Manual with environment selection

**Staging Deployment:**
1. Pull Docker images by tag
2. Run database migrations
3. Deploy services via Docker Compose
4. Run smoke tests (health checks)
5. Post Slack notification

**Production Deployment (Blue-Green):**
1. Determine inactive environment (blue/green)
2. Pull images to inactive environment
3. Run database migrations with backup
4. Deploy to inactive environment
5. Run smoke tests
6. Switch traffic to new environment
7. Monitor error rates for 10 minutes
8. Auto-rollback if error rate >1% or P95 latency >2s
9. Stop old environment on success

**Required Secrets:**
- `STAGING_SSH_KEY`, `STAGING_HOST`, `STAGING_USER`
- `PRODUCTION_SSH_KEY`, `PRODUCTION_HOST`, `PRODUCTION_USER`
- `SLACK_WEBHOOK_URL`
- `API_TEST_TOKEN`

### 4. Evaluation Workflow (`.github/workflows/eval.yml`)

**Triggers:** PRs affecting extraction code

**Features:**
- Run AI extraction evaluation suite
- Post results as PR comment
- Fail if metrics regress below targets

---

## Docker Deployment

### Dockerfiles

**Multi-stage builds** for production optimization:

1. **`packages/api/Dockerfile`**
   - Base: Node 20 Alpine
   - Non-root user (apiuser)
   - Health check on `/health`
   - Exposed port: 3001

2. **`packages/worker/Dockerfile`**
   - Base: Node 20 Alpine
   - Non-root user (workeruser)
   - Health check via Redis ping

3. **`packages/web/Dockerfile`**
   - Base: Node 20 Alpine
   - Next.js standalone build
   - Non-root user (nextjs)
   - Exposed port: 3000

### Docker Compose Production

**File:** `docker-compose.production.yml`

**Services:**
- postgres (2 CPU, 2GB RAM)
- redis (1 CPU, 512MB RAM)
- api (replicas: 2, 0.5-2 CPU, 512MB-1GB RAM)
- worker (replicas: 3, 1-2 CPU, 1GB-2GB RAM)
- web (replicas: 2, 0.5-1 CPU, 256MB-512MB RAM)
- jaeger (OpenTelemetry collector)
- prometheus (metrics)
- grafana (dashboards)

**Features:**
- Health checks for all services
- Resource limits and reservations
- Automatic restart policies
- Volume persistence

**Usage:**
```bash
# Set environment variables
export IMAGE_TAG=abc1234
export POSTGRES_PASSWORD=secure_password
export JWT_SECRET=your_secret

# Deploy
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Scale workers
docker-compose -f docker-compose.production.yml up -d --scale worker=5
```

---

## Kubernetes Deployment

### Manifests Structure

```
k8s/
├── common/
│   ├── namespace.yaml          # docuflow namespace
│   ├── configmap.yaml          # Environment config
│   ├── secrets.yaml            # Sensitive data
│   └── ingress.yaml            # TLS ingress
├── api/
│   ├── deployment.yaml         # API deployment
│   ├── service.yaml            # ClusterIP service
│   └── hpa.yaml                # Horizontal Pod Autoscaler
├── worker/
│   ├── deployment.yaml         # Worker deployment
│   └── hpa.yaml                # HPA (3-20 replicas)
└── web/
    └── deployment.yaml         # Web deployment + service
```

### Deployment

```bash
# Apply all manifests
kubectl apply -f k8s/common/
kubectl apply -f k8s/api/
kubectl apply -f k8s/worker/
kubectl apply -f k8s/web/

# Check status
kubectl get all -n docuflow

# View logs
kubectl logs -n docuflow -l app=docuflow-api -f

# Scale manually
kubectl scale deployment/docuflow-worker --replicas=10 -n docuflow
```

### Horizontal Pod Autoscaler (HPA)

**API HPA:**
- Min replicas: 3
- Max replicas: 10
- Target CPU: 70%
- Target Memory: 80%

**Worker HPA:**
- Min replicas: 3
- Max replicas: 20
- Target CPU: 70%
- Target Memory: 80%

**Scaling Behavior:**
- Scale up: Fast (100% every 15s, max 2 pods)
- Scale down: Gradual (50% every 60s, 5min stabilization)

---

## Observability

### OpenTelemetry Instrumentation

#### Backend (API & Worker)

**File:** `packages/api/src/telemetry-enhanced.ts`

**Features:**
- Automatic HTTP request tracing
- Express middleware instrumentation
- PostgreSQL query tracing
- Redis operation tracing
- Custom span helpers

**Custom Span Creation:**
```typescript
import { traceAsyncOperation } from './telemetry-enhanced';

const result = await traceAsyncOperation(
  'document.process',
  async () => {
    // Your code here
    return processDocument(doc);
  },
  {
    'document.id': documentId,
    'tenant.id': tenantId,
  }
);
```

**OpenAI Call Tracing:**
```typescript
import { createOpenAISpan, recordOpenAIMetrics } from './telemetry-enhanced';

const span = createOpenAISpan('gpt-4', 'completion');
try {
  const response = await openai.chat.completions.create({...});
  recordOpenAIMetrics(span, promptTokens, completionTokens, cost);
  span.end();
} catch (error) {
  span.recordException(error);
  span.end();
}
```

#### Frontend (Web)

**File:** `packages/web/src/lib/analytics.ts`

**Features:**
- Web Vitals tracking (CLS, FID, LCP, FCP, TTFB, INP)
- Page view tracking
- Custom event tracking
- Error tracking
- API call latency tracking
- Feature usage tracking

**Usage:**
```typescript
import { trackEvent, trackPageView, trackDocumentUpload } from '@/lib/analytics';

// Track page view
trackPageView('/documents');

// Track custom event
trackEvent('filter_applied', { filterType: 'status', value: 'completed' });

// Track document upload
trackDocumentUpload('started', { fileSize: 1024000, fileType: 'pdf' });
```

**Error Boundary:**
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Traces

Viewable in Jaeger UI:
- URL: http://localhost:16686
- Production: https://jaeger.docuflow.example.com

**Trace Context:**
- service.name
- trace.id
- span.id
- Automatic parent-child relationships

---

## Metrics

### Prometheus Metrics

**File:** `packages/api/src/metrics.ts`

#### Document Metrics

```promql
# Total documents processed
documents_processed_total{tenant_id="tenant1",status="success"}

# Document processing duration (95th percentile)
histogram_quantile(0.95, rate(document_processing_duration_seconds_bucket[5m]))

# Documents processed per minute
rate(documents_processed_total[1m]) * 60
```

#### API Metrics

```promql
# Request rate
rate(api_requests_total[5m])

# Error rate
rate(api_requests_total{status_code=~"5.."}[5m]) / rate(api_requests_total[5m])

# P95 latency
histogram_quantile(0.95, rate(api_request_duration_seconds_bucket[5m]))

# Requests by endpoint
sum by (endpoint) (rate(api_requests_total[5m]))
```

#### OpenAI Metrics

```promql
# Cost per hour
rate(openai_cost_dollars[1h]) * 3600

# API latency by model
histogram_quantile(0.95, rate(openai_api_latency_seconds_bucket[5m])) by (model)

# Total spend today
increase(openai_cost_dollars[24h])
```

#### Queue Metrics

```promql
# Current queue size
queue_size{queue_name="documents"}

# Active worker jobs
worker_jobs_active

# Job processing rate
rate(documents_processed_total[5m])
```

#### Cache Metrics

```promql
# Cache hit rate
sum(rate(cache_requests_total{result="hit"}[5m])) / sum(rate(cache_requests_total[5m]))

# Cache misses per second
rate(cache_requests_total{result="miss"}[5m])
```

### Metrics Endpoint

Prometheus metrics available at:
- http://localhost:9464/metrics (API)
- http://localhost:9090 (Prometheus UI)

### Recording Metrics in Code

```typescript
import {
  recordDocumentProcessed,
  recordDocumentProcessingTime,
  recordOpenAICall
} from './metrics';

// Record document processed
recordDocumentProcessed(tenantId, 'success', 'invoice');

// Record processing time
const start = Date.now();
// ... process document
const duration = (Date.now() - start) / 1000;
recordDocumentProcessingTime(tenantId, 'extraction', 'invoice', duration);

// Record OpenAI call
recordOpenAICall(tenantId, 'gpt-4', 'completion', 0.05, 2.3, 'success');
```

---

## Dashboards

### Grafana Dashboards

**Access:** http://localhost:3002 (username: admin, password: from env)

#### 1. Docuflow Overview Dashboard

**File:** `monitoring/grafana/dashboards/docuflow-overview.json`

**Panels:**
- Request Rate (req/s)
- Error Rate (%)
- P95 Latency (ms)
- Documents Processed (per minute)
- Queue Size
- Active Workers
- OpenAI Cost ($ per hour)
- WebSocket Connections

**Variables:**
- Time range
- Tenant filter
- Environment filter

#### 2. Cost Tracking Dashboard

**Metrics:**
- Total OpenAI cost by tenant
- Cost per document
- Token usage trends
- Most expensive operations

#### 3. Performance Dashboard

**Metrics:**
- RED metrics (Rate, Errors, Duration)
- Database query latencies
- Redis operation times
- Queue processing times
- Worker utilization

#### 4. Frontend Dashboard

**Metrics:**
- Web Vitals (CLS, FID, LCP)
- Page load times
- API call latencies from frontend
- Error rates
- User journey funnels

### Creating Custom Dashboards

1. Access Grafana UI
2. Click "+" → "Dashboard"
3. Add panel with PromQL query
4. Configure visualization
5. Save dashboard
6. Export JSON to `monitoring/grafana/dashboards/`

---

## Alerting

### Alert Rules (Example)

**File:** `monitoring/alert_rules.yml` (create this)

```yaml
groups:
  - name: docuflow_alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(api_requests_total{status_code=~"5.."}[5m]) / rate(api_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      # High latency
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(api_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High P95 latency"
          description: "P95 latency is {{ $value }}s"

      # Queue growing
      - alert: QueueGrowing
        expr: queue_size > 1000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Queue size growing"
          description: "Queue size is {{ $value }}"

      # High OpenAI cost
      - alert: HighOpenAICost
        expr: rate(openai_cost_dollars[1h]) * 3600 > 100
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "High OpenAI spending"
          description: "Spending ${{ $value }}/hour"

      # Low cache hit rate
      - alert: LowCacheHitRate
        expr: sum(rate(cache_requests_total{result="hit"}[5m])) / sum(rate(cache_requests_total[5m])) < 0.5
        for: 15m
        labels:
          severity: info
        annotations:
          summary: "Low cache hit rate"
          description: "Cache hit rate is {{ $value | humanizePercentage }}"
```

### Notification Channels

Configure in Grafana:
1. Alerting → Notification channels
2. Add channel (Slack, PagerDuty, Email, etc.)
3. Test notification
4. Link to alert rules

---

## Troubleshooting

### Check Service Health

```bash
# Docker Compose
docker-compose ps
docker-compose logs api

# Kubernetes
kubectl get pods -n docuflow
kubectl describe pod <pod-name> -n docuflow
kubectl logs -n docuflow -l app=docuflow-api --tail=100
```

### View Traces

1. Open Jaeger UI
2. Select service (docuflow-api, docuflow-worker)
3. Search by operation or tags
4. Analyze slow traces

### Query Metrics

```bash
# Via PromQL in Prometheus UI
http://localhost:9090/graph

# Via command line
curl 'http://localhost:9090/api/v1/query?query=rate(api_requests_total[5m])'
```

### Debug Instrumentation

```typescript
// Enable debug logging
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
```

---

## Best Practices

### 1. Metrics
- Keep cardinality low (avoid high-cardinality labels like user IDs)
- Use histograms for latencies
- Use counters for cumulative values
- Use gauges for current values

### 2. Tracing
- Add meaningful span names
- Include relevant attributes
- Don't trace everything (performance impact)
- Use sampling in production

### 3. Logging
- Log structured JSON
- Include trace IDs in logs
- Use appropriate log levels
- Don't log sensitive data

### 4. Dashboards
- Focus on actionable metrics
- Use consistent colors
- Add annotations for deployments
- Create separate dashboards for different audiences

### 5. Alerts
- Alert on symptoms, not causes
- Avoid alert fatigue
- Include runbook links
- Test alerts regularly

---

## Next Steps

1. Set up Alertmanager for alert routing
2. Add custom business metrics
3. Create team-specific dashboards
4. Implement distributed tracing across services
5. Set up log aggregation (ELK/Loki)
6. Add synthetic monitoring
7. Implement SLO tracking
