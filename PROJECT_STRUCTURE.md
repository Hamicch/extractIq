# Docuflow Project Structure

## 🎯 Overview

**Docuflow** is an AI-native document intelligence platform that enables upload to insight workflow. It's a TypeScript monorepo using npm workspaces and Turbo for build orchestration.

**Tagline:** _"Flow from upload to insight"_

---

## 🏗️ Architecture

```
Monorepo (npm workspaces + Turbo)
├── Frontend (Next.js)
├── Backend API (Express)
├── Background Workers (BullMQ)
└── Shared Libraries (DB, Shared, UI)
```

**Technology Stack:**

- **Language:** TypeScript
- **Frontend:** Next.js 14, React 18, TailwindCSS
- **Backend:** Express.js, Socket.IO
- **Database:** PostgreSQL + Drizzle ORM
- **Queue:** BullMQ + Redis
- **AI:** OpenAI GPT-4, pdf-parse
- **Observability:** OpenTelemetry, Prometheus, Grafana, Jaeger
- **Testing:** Jest, Playwright, React Testing Library
- **Build:** Turbo (monorepo orchestration)
- **CI/CD:** GitHub Actions, Docker, Kubernetes

---

## 📦 Workspace Packages

### 1. **@extractiq/api** - Backend API Server

**Location:** `packages/api/`

**Purpose:** RESTful API server handling HTTP requests, authentication, WebSocket connections, and job queue management.

**Key Technologies:**

- Express.js
- Socket.IO (real-time updates)
- BullMQ (job queuing)
- JWT authentication
- OpenAPI validation
- Rate limiting

**Directory Structure:**

```
packages/api/src/
├── index.ts                    # Main entry point
├── routes/                     # API endpoints
│   ├── auth.ts                 # Authentication routes
│   └── documents.ts            # Document CRUD routes
├── middleware/                 # Express middleware
│   ├── error-handler.ts        # Global error handling
│   ├── auth.ts                 # JWT verification
│   └── metrics.ts              # Prometheus metrics (NEW)
├── websocket/                  # WebSocket server
│   └── server.ts               # Socket.IO server
├── telemetry.ts                # Basic OpenTelemetry setup
├── telemetry-enhanced.ts       # Enhanced tracing (NEW)
├── metrics.ts                  # Prometheus metrics (NEW)
└── __tests__/                  # Unit tests
```

**Key Features:**

- REST API with OpenAPI validation
- JWT-based authentication
- WebSocket for real-time document updates
- Job queue integration (adds jobs to BullMQ)
- Rate limiting and security (helmet, CORS)
- Request/response logging (morgan)
- Metrics collection (Prometheus)
- Distributed tracing (OpenTelemetry)

**Ports:**

- HTTP: 3001 (configurable via `API_PORT`)
- Metrics: 9464 (Prometheus scrape endpoint)

**Dependencies:**

- `@extractiq/db` - Database access
- `@extractiq/shared` - Shared types/utils

---

### 2. **@extractiq/worker** - Background Job Processor

**Location:** `packages/worker/`

**Purpose:** Processes background jobs from the queue, handles document processing, OCR, AI extraction, and evaluation.

**Key Technologies:**

- BullMQ (job processing)
- OpenAI API (GPT-4)
- pdf-parse (PDF text extraction)
- Socket.IO client (progress updates)

**Directory Structure:**

```
packages/worker/src/
├── index.ts                    # Worker entry point
├── queue/                      # Queue configuration
│   └── worker.ts               # BullMQ worker setup
├── jobs/                       # Job handlers
│   ├── process-document.ts     # Main document job
│   ├── ocr-job.ts              # OCR processing
│   ├── extract-job.ts          # AI extraction
│   └── validate-job.ts         # Validation
├── agents/                     # AI agents (NEW)
│   ├── ocr-processor.ts        # PDF text extraction
│   └── document-extractor.ts   # GPT-4 extraction + validation
├── schemas/                    # Data schemas (NEW)
│   └── extraction-schemas.ts   # Zod schemas for documents
├── eval/                       # Evaluation framework (NEW)
│   ├── run-eval.ts             # CLI entry point
│   ├── evaluator.ts            # Main evaluator
│   ├── metrics.ts              # Metric calculations
│   ├── types.ts                # TypeScript types
│   ├── golden-dataset.json     # Test samples
│   └── README.md               # Eval documentation
├── websocket/                  # WebSocket client
│   └── client.ts               # Socket.IO client
├── telemetry.ts                # OpenTelemetry setup
└── test-data/                  # Test PDFs (NEW)
    ├── invoices/
    ├── contracts/
    └── generic/
```

**Key Features:**

- BullMQ worker with concurrency control
- Document processing pipeline:
  1. OCR (pdf-parse)
  2. Type detection (GPT-4)
  3. Schema-guided extraction (GPT-4 + Zod)
  4. Validation (cross-field checks)
  5. Self-correction (retry with error feedback)
- AI Extraction System:
  - Supports 3 document types (invoices, contracts, generic)
  - Confidence scoring per field
  - Max 2 retry attempts
  - Audit trail logging
- Evaluation Framework:
  - Golden dataset with 10 samples
  - Metrics: accuracy, precision, recall, F1, calibration
  - Performance: latency (P50/P90/P95/P99), cost tracking
  - CI/CD integration
- Real-time progress updates via WebSocket
- OpenTelemetry tracing

**Scripts:**

- `npm run dev` - Run worker in dev mode
- `npm run eval` - Run AI extraction evaluation
- `npm run eval:watch` - Watch mode for evaluation

**Dependencies:**

- `@extractiq/db` - Database access
- `@extractiq/shared` - Shared types
- `openai` - GPT-4 API
- `pdf-parse` - PDF processing
- `bullmq` - Job queue

---

### 3. **@extractiq/web** - Frontend Web Application

**Location:** `packages/web/`

**Purpose:** Next.js web application providing the user interface for document management.

**Key Technologies:**

- Next.js 14 (App Router)
- React 18
- TailwindCSS
- Tanstack Query (data fetching)
- Zustand (state management)
- Socket.IO client (real-time)

**Directory Structure:**

```
packages/web/src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── dashboard/              # Dashboard pages
│   ├── documents/              # Document pages
│   └── settings/               # Settings pages
├── components/                 # React components
│   ├── ui/                     # UI components (from @extractiq/ui)
│   ├── DocumentUpload.tsx      # Upload component
│   ├── DocumentList.tsx        # List view
│   ├── AnalyticsDashboard.tsx  # Analytics
│   └── ErrorBoundary.tsx       # Error handling (NEW)
├── hooks/                      # Custom React hooks
│   ├── useDocuments.ts         # Document queries
│   ├── useWebSocket.ts         # WebSocket connection
│   └── useAuth.ts              # Authentication
├── lib/                        # Utilities
│   ├── api.ts                  # API client (axios)
│   └── analytics.ts            # Web Vitals tracking (NEW)
├── contexts/                   # React contexts
│   └── AuthContext.tsx         # Auth provider
└── mocks/                      # MSW mocks for testing
```

**Key Features:**

- Document upload with drag-and-drop (react-dropzone)
- Real-time processing updates (Socket.IO)
- Document management (list, view, edit, delete)
- Analytics dashboard (recharts)
- Responsive design (TailwindCSS)
- Dark mode support (next-themes)
- Web Vitals tracking (NEW)
- Error boundary with automatic reporting (NEW)
- Optimistic UI updates (Tanstack Query)

**Frontend Instrumentation (NEW):**

- Web Vitals: CLS, FID, LCP, FCP, TTFB, INP
- Page view tracking
- Custom event tracking
- API latency monitoring
- Error tracking
- Feature usage analytics

**Ports:**

- Development: 3000
- Production: 3000

**Dependencies:**

- `@extractiq/shared` - Shared types
- `@extractiq/ui` - UI component library
- `next` - Framework
- `socket.io-client` - Real-time

---

### 4. **@extractiq/db** - Database Layer

**Location:** `packages/db/`

**Purpose:** Database schema, migrations, and query utilities using Drizzle ORM.

**Key Technologies:**

- Drizzle ORM
- PostgreSQL
- Drizzle Kit (migrations)

**Directory Structure:**

```
packages/db/src/
├── index.ts                    # Exports client + schemas
├── client.ts                   # Database connection
├── schema/                     # Database schemas
│   ├── documents.ts            # Documents table
│   ├── users.ts                # Users table
│   ├── processing-audit-log.ts # Audit log table
│   └── index.ts                # Schema exports
├── seed.ts                     # Seed data script
└── drizzle/                    # Generated migrations
```

**Database Schema:**

- **users** - User accounts (id, email, password, tenant_id)
- **documents** - Document metadata (id, filename, status, tenant_id)
- **processing_audit_log** - Processing history (stage, status, duration, cost)

**Key Features:**

- Type-safe queries with Drizzle ORM
- Automatic migrations with Drizzle Kit
- Connection pooling
- Transaction support
- Seed data for development

**Scripts:**

- `npm run db:generate` - Generate migrations from schema
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio GUI
- `npm run db:seed` - Seed test data

**Database Connection:**

```typescript
import { db } from '@extractiq/db';

// Use anywhere in api/worker packages
const documents = await db.select().from(documentsTable);
```

---

### 5. **@extractiq/shared** - Shared Types & Utilities

**Location:** `packages/shared/`

**Purpose:** Shared TypeScript types, interfaces, constants, and utilities used across packages.

**Directory Structure:**

```
packages/shared/src/
├── index.ts                    # Main exports
├── types/                      # TypeScript types
│   ├── document.ts             # Document types
│   ├── user.ts                 # User types
│   ├── job.ts                  # Job types
│   └── api.ts                  # API types
├── constants/                  # Constants
│   ├── document-statuses.ts    # Status enums
│   └── errors.ts               # Error codes
└── utils/                      # Utility functions
    ├── validation.ts           # Validators
    └── formatting.ts           # Formatters
```

**Purpose:**

- Single source of truth for types
- Ensures consistency across frontend/backend
- Shared validation logic
- Common constants

**Example Types:**

```typescript
export interface Document {
  id: string;
  filename: string;
  status: DocumentStatus;
  tenantId: string;
  createdAt: Date;
}

export enum DocumentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
```

**Dependencies:** None (pure TypeScript)

---

### 6. **@extractiq/ui** - UI Component Library

**Location:** `packages/ui/`

**Purpose:** Reusable React UI components (shadcn/ui based).

**Directory Structure:**

```
packages/ui/src/
├── index.ts                    # Component exports
├── button.tsx                  # Button component
├── card.tsx                    # Card component
├── input.tsx                   # Input component
├── dialog.tsx                  # Dialog component
├── table.tsx                   # Table component
└── ...                         # More components
```

**Key Features:**

- Based on shadcn/ui (Radix UI + TailwindCSS)
- Accessible components (WCAG compliant)
- Dark mode support
- Customizable with Tailwind
- TypeScript types included

**Usage in Web:**

```tsx
import { Button, Card } from '@extractiq/ui';

<Button variant="primary">Upload</Button>;
```

---

## 🔄 Data Flow

### Document Upload Flow

```
┌──────────┐     ┌─────────┐     ┌──────────┐     ┌────────┐
│  Web     │────▶│  API    │────▶│  Worker  │────▶│  DB    │
│ (Next.js)│     │(Express)│     │ (BullMQ) │     │(Postgres)
└──────────┘     └─────────┘     └──────────┘     └────────┘
     │                │                 │               │
     │   1. Upload    │   2. Create     │  3. Process   │
     │   Document     │   Job in Queue  │  Document     │
     │                │                 │               │
     │◀───────────────┴─────────────────┴───────────────┘
     │           4. Real-time Updates (WebSocket)
```

**Detailed Steps:**

1. **User uploads document** (Web → API)
   - POST `/api/documents` with file
   - File saved to storage (S3/local)
   - Document record created in DB

2. **API creates background job** (API → Redis)
   - Add job to BullMQ queue
   - Job data: { documentId, filename, tenantId }
   - Return 202 Accepted to user

3. **Worker processes job** (Worker → OpenAI → DB)
   - Pick job from queue
   - **Stage 1: OCR** - Extract text from PDF (pdf-parse)
   - **Stage 2: Type Detection** - Identify document type (GPT-4)
   - **Stage 3: Extraction** - Extract structured data (GPT-4 + Zod)
   - **Stage 4: Validation** - Validate and self-correct (max 2 retries)
   - Save results to DB
   - Update document status

4. **Real-time updates** (Worker → API → Web)
   - Worker emits progress via Socket.IO
   - API broadcasts to connected clients
   - Web updates UI in real-time

---

## 🚀 Running the Project

### Prerequisites

```bash
# Required
Node.js >= 18
npm >= 9
PostgreSQL
Redis

# Optional for monitoring
Docker (for Jaeger, Prometheus, Grafana)
```

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Start infrastructure (Postgres, Redis, Jaeger, Prometheus, Grafana)
docker-compose up -d

# 3. Setup database
npm run db:push       # Push schema
npm run db:seed       # Seed test data

# 4. Configure environment
cp .env.example .env
# Edit .env with your values
```

### Development

```bash
# Run all services in development mode
npm run dev

# This starts:
# - Web:    http://localhost:3000
# - API:    http://localhost:3001
# - Worker: (background process)

# Run individual packages
cd packages/api && npm run dev
cd packages/worker && npm run dev
cd packages/web && npm run dev
```

### Testing

```bash
# Run all tests
npm test

# Run specific package tests
npm test --workspace=@extractiq/api
npm test --workspace=@extractiq/worker
npm test --workspace=@extractiq/web

# E2E tests
npx playwright test

# AI extraction evaluation
cd packages/worker && npm run eval
```

### Building

```bash
# Build all packages
npm run build

# Build specific package
npm run build --workspace=@extractiq/api

# Production build order (Turbo handles automatically):
# 1. @extractiq/shared
# 2. @extractiq/db
# 3. @extractiq/ui
# 4. @extractiq/api, @extractiq/worker, @extractiq/web
```

---

## 📊 Monitoring & Observability

### Monitoring Stack

**Jaeger** (Distributed Tracing)

- URL: http://localhost:16686
- View request traces across services
- Analyze slow operations

**Prometheus** (Metrics)

- URL: http://localhost:9090
- Query metrics with PromQL
- View scrape targets

**Grafana** (Dashboards)

- URL: http://localhost:3002
- Login: admin/admin
- Pre-configured Prometheus datasource
- Custom dashboards

### Metrics Collected

**API Metrics:**

- Request rate, error rate, latency (RED metrics)
- Endpoint-level metrics
- WebSocket connections
- Queue size

**Worker Metrics:**

- Documents processed (total, by status, by type)
- Processing duration by stage
- OpenAI API latency and cost
- Active jobs, queue depth

**Frontend Metrics:**

- Web Vitals (CLS, FID, LCP)
- Page load times
- API call latencies
- Error rates

**Custom Business Metrics:**

- Cost per document
- Success rate by document type
- Confidence score distribution

### Tracing

OpenTelemetry traces automatically capture:

- HTTP requests (Express)
- Database queries (Drizzle)
- Redis operations
- OpenAI API calls
- Custom spans for document processing stages

---

## 🔒 Security

**Authentication:**

- JWT-based auth
- bcrypt password hashing
- Token expiration

**API Security:**

- Rate limiting (express-rate-limit)
- Helmet.js security headers
- CORS configuration
- Input validation (express-openapi-validator)

**Database Security:**

- Parameterized queries (Drizzle ORM)
- Multi-tenancy isolation
- Connection pooling

---

## 📚 Key Files

### Configuration

- `package.json` - Root package with workspaces
- `turbo.json` - Turbo build pipeline config
- `tsconfig.json` - Base TypeScript config
- `.env` - Environment variables
- `docker-compose.yml` - Development infrastructure
- `docker-compose.production.yml` - Production deployment

### CI/CD

- `.github/workflows/test.yml` - Test workflow
- `.github/workflows/build.yml` - Build Docker images
- `.github/workflows/deploy.yml` - Deploy to staging/production
- `.github/workflows/eval.yml` - AI evaluation on PRs

### Deployment

- `packages/*/Dockerfile` - Docker images for each service
- `k8s/` - Kubernetes manifests
- `monitoring/` - Prometheus, Grafana configs

### Documentation

- `README.md` - Main README
- `CI_CD_OBSERVABILITY.md` - CI/CD and monitoring guide
- `AI_EXTRACTION_IMPLEMENTATION.md` - AI extraction docs
- `IMPLEMENTATION_SUMMARY.md` - Latest implementation summary
- `PROJECT_STRUCTURE.md` - This file

---

## 🎯 Development Workflow

### Adding a New Feature

1. **Create branch**

   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes** in relevant packages
   - API endpoints → `packages/api/src/routes/`
   - Background jobs → `packages/worker/src/jobs/`
   - UI → `packages/web/src/`
   - Shared types → `packages/shared/src/types/`

3. **Add tests**

   ```bash
   # Unit tests in __tests__/ directories
   npm test --workspace=@extractiq/api
   ```

4. **Run checks locally**

   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

5. **Push and create PR**

   ```bash
   git push origin feature/my-feature
   # Create PR on GitHub
   ```

6. **CI automatically runs:**
   - Tests (unit + E2E)
   - Type checking
   - Linting
   - Coverage checks (80% backend, 70% frontend)
   - AI evaluation (if extraction code changed)
   - Build verification

7. **After approval, merge**
   - Build workflow creates Docker images
   - Deploy workflow (manual trigger) deploys to staging/production

---

## 🔮 Future Considerations

**Scalability:**

- Redis Cluster for queue
- PostgreSQL read replicas
- Horizontal scaling with K8s HPA (already configured)

**Features:**

- Multi-language support
- Advanced document types
- Document comparison
- Batch processing
- API versioning
- Webhook integrations

**Observability:**

- ELK/Loki for log aggregation
- SLO tracking
- Custom alert rules
- Cost optimization dashboards

---

## 📞 Contact & Resources

**Project:** Docuflow - AI-native document intelligence platform
**Architecture:** TypeScript monorepo with npm workspaces + Turbo
**Packages:** 6 (api, worker, web, db, shared, ui)
**Status:** Production-ready with full CI/CD and observability
