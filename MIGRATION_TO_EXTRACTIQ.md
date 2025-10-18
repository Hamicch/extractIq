# ExtractIQ - Architecture & Migration Guide

**Domain:** extractiq.xyz
**Tagline:** _"Flow from upload to insight"_

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Philosophy](#architecture-philosophy)
3. [Technology Stack & Justification](#technology-stack--justification)
4. [New Project Structure](#new-project-structure)
5. [Package Breakdown](#package-breakdown)
6. [Migration Progress](#migration-progress)
7. [Deployment Strategy](#deployment-strategy)
8. [Cost Analysis](#cost-analysis)
9. [Development Workflow](#development-workflow)
10. [Testing Strategy](#testing-strategy)

---

## 🎯 Project Overview

### What is ExtractIQ?

ExtractIQ is an AI-native document intelligence platform that enables seamless document processing from upload to structured data extraction. It processes PDFs, invoices, contracts, and other documents using advanced AI to extract meaningful, structured information.

### Key Features

- **Smart Document Upload**: Drag-and-drop interface with real-time progress tracking
- **AI-Powered Extraction**: Leverages OpenAI GPT-4o-mini for intelligent data extraction
- **Real-Time Updates**: WebSocket-based live progress notifications
- **Multi-Tenant Architecture**: Secure tenant isolation with API key authentication
- **Type-Safe Processing**: Schema-validated extraction using Zod
- **Production-Grade**: Error handling, retries, audit logging, and telemetry

### Current Status

- **Stage**: Pre-launch (No active users)
- **Goal**: Production-ready architecture at minimal cost
- **Migration**: From DocuFlow to ExtractIQ with architectural improvements

---

## 🏛️ Architecture Philosophy

### Design Principles

1. **Clean Architecture**: Business logic independent of frameworks
2. **Cost-Efficiency**: Minimal infrastructure while maintaining quality
3. **Scalability Path**: Easy to scale when revenue justifies it
4. **Maintainability**: Clear structure for long-term development
5. **Testability**: High test coverage without infrastructure dependencies

### Architecture Pattern: Simplified Hexagonal (Ports & Adapters)

```
┌─────────────────────────────────────────────────┐
│                   Web Layer                      │
│  (Next.js API Routes + Frontend + Background)   │
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌───────────┐│
│  │ API Routes │  │  Frontend  │  │ BG Worker ││
│  └──────┬─────┘  └──────┬─────┘  └─────┬─────┘│
│         │               │              │       │
└─────────┼───────────────┼──────────────┼───────┘
          │               │              │
          └───────────────┴──────────────┘
                         │
          ┌──────────────▼───────────────┐
          │      Core Layer (Domain)     │
          │  ┌──────────┐  ┌──────────┐ │
          │  │ Entities │  │Use Cases │ │
          │  └──────────┘  └──────────┘ │
          │  ┌──────────────────────┐   │
          │  │  Ports (Interfaces)  │   │
          │  └──────────────────────┘   │
          └──────────────┬───────────────┘
                         │
          ┌──────────────▼───────────────┐
          │   Infrastructure Layer       │
          │  ┌────────┐  ┌────┐  ┌────┐│
          │  │Database│  │ AI │  │Q'ue││
          │  └────────┘  └────┘  └────┘│
          └──────────────────────────────┘
```

**Key Benefits:**
- Business logic (Core) has zero infrastructure dependencies
- Easy to test without databases, APIs, or queues
- Swappable implementations (local storage → S3, simple queue → BullMQ)
- Clear separation of concerns

---

## 🛠️ Technology Stack & Justification

### Core Technologies

| Technology | Purpose | Why We Use It |
|------------|---------|---------------|
| **TypeScript** | Language | Type safety, better DX, catches errors early |
| **Node.js 20** | Runtime | LTS version, stable, excellent ecosystem |
| **npm Workspaces** | Monorepo | Built-in, no extra tools, simple |
| **Turbo** | Build orchestration | Caching, parallel builds, fast CI |

### Frontend

| Technology | Purpose | Why We Use It |
|------------|---------|---------------|
| **Next.js 14** | Framework | App Router, API routes, SSR, excellent DX |
| **React 18** | UI Library | Industry standard, huge ecosystem |
| **TailwindCSS** | Styling | Utility-first, fast development, small bundle |
| **shadcn/ui** | Components | Accessible, customizable, copy-paste |
| **Tanstack Query** | Data fetching | Caching, optimistic updates, less boilerplate |
| **Zustand** | State management | Simple, lightweight, no boilerplate |
| **Socket.IO Client** | WebSocket | Real-time updates, automatic reconnection |

### Backend (API)

| Technology | Purpose | Why We Use It |
|------------|---------|---------------|
| **Next.js API Routes** | HTTP API | Same deployment as frontend, simpler |
| **Socket.IO** | WebSocket | Bidirectional communication, room support |
| **Zod** | Validation | Type-safe runtime validation, great DX |
| **JWT** | Authentication | Stateless, scalable, industry standard |
| **bcrypt** | Password hashing | Secure, battle-tested |

### Database & Queue

| Technology | Purpose | Why We Use It |
|------------|---------|---------------|
| **PostgreSQL 15** | Database | ACID compliant, reliable, JSON support |
| **Drizzle ORM** | Database ORM | Type-safe, lightweight, great migrations |
| **Redis 7** | Cache & Queue | Fast, reliable, BullMQ backend |
| **BullMQ** | Job Queue | Robust retry logic, priority queues, monitoring |

### AI & Processing

| Technology | Purpose | Why We Use It |
|------------|---------|---------------|
| **OpenAI GPT-4o-mini** | AI Extraction | 95% cheaper than GPT-4, great quality |
| **pdf-parse** | PDF extraction | Simple, reliable, no external dependencies |
| **Zod** | Schema validation | Type-safe extraction schemas |

### Observability (Production)

| Technology | Purpose | Why We Use It |
|------------|---------|---------------|
| **OpenTelemetry** | Tracing | Industry standard, vendor-agnostic |
| **Prometheus** | Metrics | Time-series DB, powerful queries |
| **Grafana** | Dashboards | Beautiful visualizations, free |
| **Winston** | Logging | Structured logs, multiple transports |

### Development & CI/CD

| Technology | Purpose | Why We Use It |
|------------|---------|---------------|
| **Jest** | Unit testing | Fast, great DX, snapshot testing |
| **Playwright** | E2E testing | Cross-browser, reliable, excellent API |
| **ESLint** | Linting | Code quality, catch errors |
| **Prettier** | Formatting | Consistent code style |
| **Husky** | Git hooks | Pre-commit checks |
| **GitHub Actions** | CI/CD | Free 2,000 min/month, easy to use |
| **Docker** | Containerization | Consistent environments |

---

## 📦 New Project Structure

### Overview

```
extractiq/
├── packages/
│   ├── core/                   # 🆕 Business logic (framework-agnostic)
│   ├── infrastructure/         # 🆕 Database, AI, Queue implementations
│   ├── web/                    # Next.js app (Frontend + API + Background worker)
│   ├── shared/                 # Common types and utilities
│   └── ui/                     # UI component library
│
├── k8s/                        # Kubernetes manifests (for future scaling)
├── monitoring/                 # Prometheus/Grafana configs
├── e2e/                        # End-to-end tests
│
├── docker-compose.yml          # Local development
├── docker-compose.prod.yml     # Production deployment
├── Dockerfile                  # Single container build
├── turbo.json                  # Turbo configuration
├── package.json                # Root workspace
└── tsconfig.json               # Base TypeScript config
```

### Key Changes from DocuFlow

| Old Structure | New Structure | Reason |
|---------------|---------------|--------|
| `@docuflow/api` (Express) | `@docuflow/web/app/api` (Next.js) | Simpler deployment, one less service |
| `@docuflow/worker` (Separate) | `@docuflow/web/lib/background` | Cost savings, easier development |
| `@docuflow/db` | `@docuflow/infrastructure/database` | Better organization |
| No core package | `@docuflow/core` | Clean architecture, testability |
| Mixed concerns | Clear layers | Maintainability |

---

## 🏗️ Package Breakdown

### 1. @extractiq/core (NEW)

**Purpose:** Framework-agnostic business logic

```
packages/core/
├── src/
│   ├── domain/                         # Domain models
│   │   ├── document/
│   │   │   ├── document.entity.ts      # Document aggregate root
│   │   │   ├── document.value-objects.ts # Value objects (DocumentStatus, etc.)
│   │   │   ├── document.repository.interface.ts # Repository contract
│   │   │   └── document.events.ts      # Domain events
│   │   │
│   │   ├── user/
│   │   │   ├── user.entity.ts
│   │   │   ├── user.repository.interface.ts
│   │   │   └── user.events.ts
│   │   │
│   │   └── shared/
│   │       ├── base-entity.ts          # Base class for entities
│   │       ├── value-object.ts         # Base class for VOs
│   │       └── aggregate-root.ts
│   │
│   ├── use-cases/                      # Application services
│   │   ├── documents/
│   │   │   ├── upload-document.use-case.ts
│   │   │   ├── process-document.use-case.ts
│   │   │   ├── get-document.use-case.ts
│   │   │   ├── list-documents.use-case.ts
│   │   │   └── delete-document.use-case.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── register-user.use-case.ts
│   │   │   ├── login.use-case.ts
│   │   │   └── validate-token.use-case.ts
│   │   │
│   │   └── shared/
│   │       └── base.use-case.ts
│   │
│   ├── ports/                          # Interfaces (Hexagonal Architecture)
│   │   ├── repositories/
│   │   │   ├── document.repository.ts
│   │   │   ├── user.repository.ts
│   │   │   └── api-key.repository.ts
│   │   │
│   │   ├── services/
│   │   │   ├── ai-extractor.service.ts # AI processing interface
│   │   │   ├── pdf-processor.service.ts # PDF text extraction
│   │   │   ├── file-storage.service.ts  # File storage interface
│   │   │   ├── queue.service.ts         # Job queue interface
│   │   │   └── notification.service.ts  # WebSocket/email notifications
│   │   │
│   │   └── events/
│   │       └── event-publisher.ts       # Event bus interface
│   │
│   └── types/                          # Domain types
│       ├── document.types.ts
│       ├── user.types.ts
│       ├── result.ts                   # Result<T, E> pattern for errors
│       ├── errors.ts                   # Domain errors
│       └── pagination.ts
│
├── __tests__/
│   ├── unit/                           # Pure business logic tests
│   │   ├── domain/
│   │   └── use-cases/
│   └── fixtures/                       # Test data
│
├── package.json
└── tsconfig.json
```

**Why This Structure:**

- **Domain**: Pure business entities with no dependencies
- **Use Cases**: Orchestrate workflows, enforce business rules
- **Ports**: Define contracts for external systems
- **Zero Dependencies**: No frameworks, databases, or external services
- **100% Testable**: Mock interfaces, no infrastructure needed

**Example Entity:**

```typescript
// packages/core/src/domain/document/document.entity.ts
import { BaseEntity } from '../shared/base-entity';
import { DocumentStatus } from './document.value-objects';

export class Document extends BaseEntity {
  constructor(
    id: string,
    public readonly filename: string,
    public readonly tenantId: string,
    public status: DocumentStatus,
    public extractedData?: any,
    public readonly uploadedAt: Date = new Date(),
  ) {
    super(id);
  }

  markAsProcessing(): void {
    if (this.status !== DocumentStatus.PENDING) {
      throw new Error('Can only process pending documents');
    }
    this.status = DocumentStatus.PROCESSING;
  }

  complete(extractedData: any): void {
    this.status = DocumentStatus.COMPLETED;
    this.extractedData = extractedData;
  }

  fail(error: string): void {
    this.status = DocumentStatus.FAILED;
    // Emit domain event
  }
}
```

**Example Use Case:**

```typescript
// packages/core/src/use-cases/documents/process-document.use-case.ts
import { DocumentRepository } from '../../ports/repositories/document.repository';
import { AiExtractorService } from '../../ports/services/ai-extractor.service';
import { Result } from '../../types/result';

export class ProcessDocumentUseCase {
  constructor(
    private readonly documentRepo: DocumentRepository,
    private readonly aiExtractor: AiExtractorService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(documentId: string): Promise<Result<void, Error>> {
    try {
      // 1. Get document
      const document = await this.documentRepo.findById(documentId);
      if (!document) {
        return Result.fail(new Error('Document not found'));
      }

      // 2. Mark as processing (business logic)
      document.markAsProcessing();
      await this.documentRepo.save(document);

      // 3. Extract data (delegates to infrastructure)
      const extractedData = await this.aiExtractor.extract(document);

      // 4. Complete (business logic)
      document.complete(extractedData);
      await this.documentRepo.save(document);

      // 5. Publish event
      await this.eventPublisher.publish('document.completed', { documentId });

      return Result.ok();
    } catch (error) {
      return Result.fail(error);
    }
  }
}
```

---

### 2. @extractiq/infrastructure (NEW)

**Purpose:** Implements ports defined in core

```
packages/infrastructure/
├── src/
│   ├── database/
│   │   ├── drizzle/
│   │   │   ├── client.ts               # Database connection
│   │   │   ├── schema/
│   │   │   │   ├── documents.schema.ts # Drizzle schema (NOT domain model)
│   │   │   │   ├── users.schema.ts
│   │   │   │   ├── api-keys.schema.ts
│   │   │   │   └── audit-log.schema.ts
│   │   │   └── migrations/             # Generated migrations
│   │   │
│   │   ├── repositories/               # Implements core repository interfaces
│   │   │   ├── document.repository.impl.ts
│   │   │   ├── user.repository.impl.ts
│   │   │   └── api-key.repository.impl.ts
│   │   │
│   │   └── mappers/                    # DB schema ↔ Domain entity mappers
│   │       ├── document.mapper.ts
│   │       └── user.mapper.ts
│   │
│   ├── ai/
│   │   ├── openai/
│   │   │   ├── client.ts               # OpenAI client wrapper
│   │   │   ├── extractor.service.impl.ts # Implements AiExtractorService
│   │   │   ├── pdf-processor.service.impl.ts # Implements PdfProcessorService
│   │   │   └── prompts/
│   │   │       ├── type-detection.prompt.ts
│   │   │       ├── invoice-extraction.prompt.ts
│   │   │       ├── contract-extraction.prompt.ts
│   │   │       └── generic-extraction.prompt.ts
│   │   │
│   │   └── schemas/                    # Zod schemas for AI extraction
│   │       ├── invoice.schema.ts
│   │       ├── contract.schema.ts
│   │       └── generic.schema.ts
│   │
│   ├── queue/
│   │   ├── bullmq/
│   │   │   ├── client.ts               # Redis connection
│   │   │   ├── queue.service.impl.ts   # Implements QueueService
│   │   │   └── job-schemas.ts
│   │   │
│   │   └── simple/                     # Simple in-memory queue (for dev)
│   │       └── queue.service.impl.ts
│   │
│   ├── storage/
│   │   ├── local/
│   │   │   └── storage.service.impl.ts # Local filesystem storage
│   │   │
│   │   └── s3/                         # S3 storage (for future)
│   │       └── storage.service.impl.ts
│   │
│   ├── events/
│   │   ├── event-bus.ts                # In-memory event bus
│   │   └── publishers/
│   │       ├── websocket.publisher.ts  # Publishes events to WebSocket
│   │       └── kafka.publisher.ts      # For future
│   │
│   ├── telemetry/
│   │   ├── opentelemetry/
│   │   │   ├── tracing.ts              # OpenTelemetry tracing setup
│   │   │   └── metrics.ts              # Prometheus metrics
│   │   │
│   │   └── logger/
│   │       └── winston.logger.ts       # Winston logger configuration
│   │
│   └── config/
│       ├── database.config.ts
│       ├── queue.config.ts
│       ├── ai.config.ts
│       └── env.config.ts               # Environment variables validation
│
├── __tests__/
│   ├── integration/                    # Tests with real infrastructure
│   └── fixtures/
│
├── package.json
└── tsconfig.json
```

**Why This Structure:**

- **Adapters Pattern**: Each folder implements a port from core
- **Swappable**: Easy to switch from local storage to S3, simple queue to BullMQ
- **Infrastructure Concerns**: Database, external APIs, file systems isolated here
- **Mappers**: Translate between database schemas and domain entities

**Example Repository Implementation:**

```typescript
// packages/infrastructure/src/database/repositories/document.repository.impl.ts
import { DocumentRepository } from '@extractiq/core/ports/repositories/document.repository';
import { Document } from '@extractiq/core/domain/document/document.entity';
import { db } from '../drizzle/client';
import { documents } from '../drizzle/schema/documents.schema';
import { DocumentMapper } from '../mappers/document.mapper';

export class DrizzleDocumentRepository implements DocumentRepository {
  async findById(id: string): Promise<Document | null> {
    const [row] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    return row ? DocumentMapper.toDomain(row) : null;
  }

  async save(document: Document): Promise<void> {
    const row = DocumentMapper.toPersistence(document);

    await db
      .insert(documents)
      .values(row)
      .onConflictDoUpdate({
        target: documents.id,
        set: row,
      });
  }

  async findByTenantId(tenantId: string): Promise<Document[]> {
    const rows = await db
      .select()
      .from(documents)
      .where(eq(documents.tenantId, tenantId));

    return rows.map(DocumentMapper.toDomain);
  }
}
```

**Example AI Service Implementation:**

```typescript
// packages/infrastructure/src/ai/openai/extractor.service.impl.ts
import { AiExtractorService } from '@extractiq/core/ports/services/ai-extractor.service';
import { Document } from '@extractiq/core/domain/document/document.entity';
import OpenAI from 'openai';
import { z } from 'zod';

export class OpenAIExtractorService implements AiExtractorService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async extract(document: Document): Promise<any> {
    // 1. Get PDF text
    const text = await this.extractText(document.filePath);

    // 2. Detect document type
    const docType = await this.detectType(text);

    // 3. Get appropriate schema
    const schema = this.getSchemaForType(docType);

    // 4. Extract structured data with schema
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective model
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt(docType),
        },
        {
          role: 'user',
          content: text,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const extracted = JSON.parse(response.choices[0].message.content);

    // 5. Validate with Zod
    return schema.parse(extracted);
  }
}
```

---

### 3. @extractiq/web (Next.js Application)

**Purpose:** Frontend UI, API routes, and background worker

```
packages/web/
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── api/                        # API Routes (replaces Express)
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts        # POST /api/auth/login
│   │   │   │   ├── register/
│   │   │   │   │   └── route.ts        # POST /api/auth/register
│   │   │   │   └── logout/
│   │   │   │       └── route.ts        # POST /api/auth/logout
│   │   │   │
│   │   │   ├── documents/
│   │   │   │   ├── route.ts            # GET, POST /api/documents
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts        # GET, DELETE /api/documents/:id
│   │   │   │       └── download/
│   │   │   │           └── route.ts    # GET /api/documents/:id/download
│   │   │   │
│   │   │   ├── health/
│   │   │   │   └── route.ts            # GET /api/health
│   │   │   │
│   │   │   └── metrics/
│   │   │       └── route.ts            # GET /api/metrics (Prometheus)
│   │   │
│   │   ├── (auth)/                     # Auth pages (layout group)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/                # Dashboard pages (layout group)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── documents/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Landing page
│   │   └── globals.css                 # Global styles
│   │
│   ├── lib/
│   │   ├── di/                         # Dependency Injection
│   │   │   └── container.ts            # IoC container (tsyringe)
│   │   │
│   │   ├── background/                 # Background job processor
│   │   │   ├── worker.ts               # BullMQ worker (runs in same process)
│   │   │   └── handlers/
│   │   │       └── process-document.handler.ts
│   │   │
│   │   ├── websocket/
│   │   │   ├── server.ts               # WebSocket server (Socket.IO)
│   │   │   ├── types/
│   │   │   │   ├── socket.types.ts
│   │   │   │   └── events.types.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   └── error.middleware.ts
│   │   │   ├── handlers/
│   │   │   │   ├── connection.handler.ts
│   │   │   │   ├── heartbeat.handler.ts
│   │   │   │   └── worker.handler.ts
│   │   │   └── services/
│   │   │       ├── broadcast.service.ts
│   │   │       └── client-tracking.service.ts
│   │   │
│   │   ├── middleware/                 # Next.js middleware
│   │   │   ├── auth.ts
│   │   │   └── rate-limit.ts
│   │   │
│   │   └── utils/
│   │       ├── api-response.ts
│   │       ├── error-handler.ts
│   │       └── jwt.ts
│   │
│   ├── features/                       # Frontend features (feature-based organization)
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── LogoutButton.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useLogin.ts
│   │   │   │   └── useRegister.ts
│   │   │   ├── api/
│   │   │   │   └── auth.api.ts         # API client functions
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts
│   │   │   └── utils/
│   │   │       └── token.utils.ts
│   │   │
│   │   ├── documents/
│   │   │   ├── components/
│   │   │   │   ├── DocumentUpload.tsx
│   │   │   │   ├── DocumentList.tsx
│   │   │   │   ├── DocumentViewer.tsx
│   │   │   │   └── DocumentProgress.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useDocuments.ts
│   │   │   │   ├── useUpload.ts
│   │   │   │   └── useWebSocket.ts
│   │   │   ├── api/
│   │   │   │   └── documents.api.ts
│   │   │   └── types/
│   │   │       └── document.types.ts
│   │   │
│   │   └── analytics/
│   │       ├── components/
│   │       │   ├── AnalyticsDashboard.tsx
│   │       │   └── MetricsChart.tsx
│   │       ├── hooks/
│   │       │   └── useAnalytics.ts
│   │       └── utils/
│   │           └── metrics.utils.ts
│   │
│   ├── components/                     # Shared UI components
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── AuthLayout.tsx
│   │   ├── navigation/
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   └── feedback/
│   │       ├── Toast.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── LoadingSpinner.tsx
│   │
│   ├── contexts/                       # React contexts (minimal)
│   │   └── AuthContext.tsx
│   │
│   └── styles/
│       └── globals.css
│
├── public/
│   ├── favicon.ico
│   └── images/
│
├── __tests__/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── next.config.js
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

**Why This Structure:**

- **API Routes**: Replaces Express, simpler deployment
- **Background Worker**: Runs in same Next.js process (cost savings)
- **Feature-Based Frontend**: Easier to navigate than type-based folders
- **WebSocket**: Organized by layers (types, middleware, handlers, services)

**Example API Route:**

```typescript
// app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/container';
import { UploadDocumentUseCase } from '@extractiq/core/use-cases/documents/upload-document.use-case';
import { QueueService } from '@extractiq/core/ports/services/queue.service';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const tenantId = req.headers.get('x-tenant-id')!;

    // Get use case from DI container
    const uploadUseCase = container.resolve<UploadDocumentUseCase>('UploadDocumentUseCase');

    // Execute use case
    const result = await uploadUseCase.execute({ file, tenantId });

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    const document = result.getValue();

    // Queue background processing
    const queueService = container.resolve<QueueService>('QueueService');
    await queueService.add('process-document', { documentId: document.id });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // List documents logic
}
```

**Example Background Worker:**

```typescript
// lib/background/worker.ts
import { Worker, Job } from 'bullmq';
import { container } from '@/lib/di/container';
import { ProcessDocumentUseCase } from '@extractiq/core/use-cases/documents/process-document.use-case';

export function startBackgroundWorker() {
  const worker = new Worker(
    'document-processing',
    async (job: Job) => {
      const processUseCase = container.resolve<ProcessDocumentUseCase>('ProcessDocumentUseCase');

      await processUseCase.execute(job.data.documentId);
    },
    {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      concurrency: 2, // Process 2 documents at a time
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
  });

  console.log('✅ Background worker started');

  return worker;
}

// Start worker when Next.js starts
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_WORKER === 'true') {
  startBackgroundWorker();
}
```

---

### 4. @extractiq/shared

**Purpose:** Common types, utilities, and constants

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── api/
│   │   │   ├── requests.ts
│   │   │   └── responses.ts
│   │   ├── common/
│   │   │   ├── pagination.ts
│   │   │   ├── result.ts
│   │   │   └── errors.ts
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── string.utils.ts
│   │   ├── date.utils.ts
│   │   ├── validation.utils.ts
│   │   └── index.ts
│   │
│   ├── constants/
│   │   ├── document-statuses.ts
│   │   ├── error-codes.ts
│   │   ├── events.ts
│   │   └── index.ts
│   │
│   └── schemas/                       # Shared Zod schemas
│       ├── document.schema.ts
│       ├── user.schema.ts
│       └── index.ts
│
├── __tests__/
├── package.json
└── tsconfig.json
```

---

### 5. @extractiq/ui

**Purpose:** Reusable UI components (shadcn/ui based)

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── dropdown.tsx
│   │   └── ...
│   ├── lib/
│   │   └── utils.ts                  # cn() helper, etc.
│   └── index.ts
│
├── __tests__/
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

---

## 📊 Migration Progress

### Phase 1: Foundation ✅ COMPLETED

- [x] **1.1** Rename project from DocuFlow to ExtractIQ
  - [x] Update all package.json names (`@docuflow/*` → `@extractiq/*`)
  - [x] Update import statements across codebase
  - [x] Update environment variables
  - [x] Update documentation
  - [x] Update domain references (extractiq.xyz)

- [x] **1.2** Create @extractiq/core package
  - [x] Setup package structure
  - [x] Define domain entities (Document, User)
  - [x] Create repository interfaces (ports)
  - [x] Create service interfaces (ports)
  - [x] Implement use cases (Upload, Process, Get, List, Delete, Login, Register)
  - [ ] Write unit tests (>90% coverage) - TODO

- [x] **1.3** Create @extractiq/infrastructure package
  - [x] Setup package structure
  - [x] Migrate database schema from @docuflow/db
  - [x] Implement repository adapters (Drizzle)
  - [x] Implement AI service adapter (OpenAI with GPT-4o-mini)
  - [x] Implement queue service adapter (BullMQ)
  - [x] Implement storage service (Local filesystem)
  - [x] Implement auth services (bcrypt, JWT)
  - [x] Create database mappers
  - [ ] Write integration tests - TODO

### Phase 2: Backend Consolidation ⏳

- [ ] **2.1** Migrate API to Next.js API Routes
  - [ ] Create API route structure in @extractiq/web
  - [ ] Convert auth routes (login, register, logout)
  - [ ] Convert document routes (list, upload, get, delete)
  - [ ] Add health check endpoint
  - [ ] Add metrics endpoint
  - [ ] Setup middleware (auth, rate limiting)
  - [ ] Setup dependency injection container

- [ ] **2.2** Refactor WebSocket server
  - [ ] Create new WebSocket structure (types, middleware, handlers, services)
  - [ ] Fix TypeScript type errors
  - [ ] Implement auth middleware
  - [ ] Implement connection handler
  - [ ] Implement heartbeat handler
  - [ ] Implement worker event handlers
  - [ ] Create broadcast service
  - [ ] Create client tracking service

- [ ] **2.3** Migrate Worker to Background Processor
  - [ ] Create background worker in @extractiq/web/lib/background
  - [ ] Migrate document processing logic
  - [ ] Integrate with use cases
  - [ ] Setup BullMQ worker in Next.js process
  - [ ] Add retry logic
  - [ ] Add error handling
  - [ ] Test background processing

### Phase 3: Frontend & Optimization ⏳

- [ ] **3.1** Refactor Frontend Structure
  - [ ] Reorganize to feature-based structure
  - [ ] Move auth components to features/auth
  - [ ] Move document components to features/documents
  - [ ] Move analytics components to features/analytics
  - [ ] Create shared components
  - [ ] Update imports

- [ ] **3.2** Optimize AI Costs
  - [ ] Switch from GPT-4 to GPT-4o-mini
  - [ ] Test extraction quality
  - [ ] Optimize prompts for token usage
  - [ ] Add prompt caching where possible
  - [ ] Add cost tracking metrics

- [ ] **3.3** Update Tests
  - [ ] Update unit tests for new structure
  - [ ] Update integration tests
  - [ ] Update E2E tests
  - [ ] Ensure >80% coverage

### Phase 4: Deployment & Cleanup ⏳

- [ ] **4.1** Setup Deployment
  - [ ] Create Dockerfile for single container
  - [ ] Update docker-compose for production
  - [ ] Setup deployment to Hetzner/Railway/Fly.io
  - [ ] Configure environment variables
  - [ ] Setup SSL certificate
  - [ ] Configure domain (extractiq.xyz)

- [ ] **4.2** Remove Old Packages
  - [ ] Delete @docuflow/api package
  - [ ] Delete @docuflow/worker package
  - [ ] Delete @docuflow/db package
  - [ ] Clean up unused dependencies
  - [ ] Update turbo.json

- [ ] **4.3** Documentation
  - [ ] Update README.md
  - [ ] Update API documentation
  - [ ] Create deployment guide
  - [ ] Create development guide
  - [ ] Archive old documentation

### Phase 5: Validation & Launch 🚀

- [ ] **5.1** Testing
  - [ ] Run full test suite
  - [ ] Performance testing
  - [ ] Load testing
  - [ ] Security audit

- [ ] **5.2** Monitoring
  - [ ] Setup Prometheus metrics collection
  - [ ] Setup Grafana dashboards
  - [ ] Setup error tracking
  - [ ] Setup cost monitoring

- [ ] **5.3** Launch
  - [ ] Deploy to production
  - [ ] Monitor for issues
  - [ ] Verify all features working
  - [ ] Celebrate! 🎉

---

## 🚀 Deployment Strategy

### Development Environment

```bash
# Local development with docker-compose
docker-compose up -d

# Runs:
# - PostgreSQL (port 5432)
# - Redis (port 6379)
# - Next.js dev server (port 3000)
```

### Production Deployment

**Option 1: Hetzner VPS (Recommended - $4.15/month)**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/extractiq
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - ENABLE_WORKER=true
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:15-alpine
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=extractiq
      - POSTGRES_PASSWORD=${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
```

**Deployment steps:**
```bash
# 1. SSH into VPS
ssh root@extractiq.xyz

# 2. Clone repository
git clone <repo-url> /opt/extractiq
cd /opt/extractiq

# 3. Setup environment
cp .env.example .env
nano .env  # Fill in production values

# 4. Deploy
docker-compose -f docker-compose.prod.yml up -d

# 5. Run migrations
docker-compose exec app npm run db:migrate

# 6. Check logs
docker-compose logs -f app
```

**Option 2: Railway (~$5-10/month)**

- Deploy via Railway CLI or GitHub integration
- Automatic PostgreSQL and Redis provisioning
- Environment variables via dashboard
- Auto-scaling and zero-downtime deployments

**Option 3: Fly.io (~$5-10/month)**

- Deploy via Fly CLI
- Global edge deployment
- Free PostgreSQL and Redis (with limits)
- Auto-scaling

---

## 💰 Cost Analysis

### Infrastructure Costs

| Component | Development | Production (0-1K docs/mo) | Production (1K-10K docs/mo) |
|-----------|-------------|---------------------------|------------------------------|
| **Hosting** |
| Hetzner VPS | $0 (local) | $4.15/mo | $8.30/mo (2x VPS) |
| Railway | $0 | $5-10/mo | $20-40/mo |
| Fly.io | $0 | $5-10/mo | $20-50/mo |
| **Database** |
| PostgreSQL | $0 (Docker) | $0 (self-hosted) | $15/mo (managed) |
| Redis | $0 (Docker) | $0 (self-hosted) | $10/mo (managed) |
| **Total Infrastructure** | **$0** | **$5-15/mo** | **$30-80/mo** |

### AI Costs (OpenAI)

| Model | Cost per 1K tokens (input) | Cost per 1K tokens (output) | Cost per document | 1K docs/month |
|-------|----------------------------|------------------------------|-------------------|---------------|
| GPT-4 | $0.03 | $0.06 | $0.10 | $100 |
| GPT-4o | $0.0025 | $0.01 | $0.012 | $12 |
| **GPT-4o-mini** | **$0.00015** | **$0.0006** | **$0.001** | **$1** |

**Assumptions:**
- Average document: 2K input tokens, 500 output tokens
- 1 type detection call + 1 extraction call per document
- No retries (successful extraction on first attempt)

### Total Cost Comparison

| Scale | Old Architecture (GPT-4) | New Architecture (GPT-4o-mini) | Savings |
|-------|--------------------------|--------------------------------|---------|
| **Development** | $0 | $0 | $0 |
| **0-100 docs/mo** | $65/mo | $5/mo | $60/mo (92%) |
| **1K docs/mo** | $165/mo | $10/mo | $155/mo (94%) |
| **10K docs/mo** | $1,100/mo | $80/mo | $1,020/mo (93%) |

**Key Takeaways:**
- 🎯 **Start: $5-10/month** total cost (infrastructure + AI)
- 📈 **Scale: Costs grow linearly** with document volume
- 💡 **Biggest savings: AI model choice** (95% reduction)
- 🏗️ **Architecture savings: $40-60/month** (single vs dual services)

---

## 🔧 Development Workflow

### Getting Started

```bash
# 1. Clone repository
git clone <repo-url> extractiq
cd extractiq

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your values:
# - DATABASE_URL
# - REDIS_URL
# - OPENAI_API_KEY
# - JWT_SECRET

# 4. Start infrastructure
docker-compose up -d

# 5. Run migrations
npm run db:migrate

# 6. Seed database (optional)
npm run db:seed

# 7. Start development server
npm run dev

# Access:
# - Web: http://localhost:3000
# - API: http://localhost:3000/api
```

### Common Commands

```bash
# Development
npm run dev                 # Start all packages in dev mode
npm run build              # Build all packages
npm run test               # Run all tests
npm run lint               # Lint all packages
npm run type-check         # TypeScript type checking

# Database
npm run db:generate        # Generate migration from schema changes
npm run db:migrate         # Run migrations
npm run db:studio          # Open Drizzle Studio (GUI)
npm run db:seed            # Seed test data

# Testing
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e           # E2E tests
npm run test:coverage      # Coverage report

# Package-specific
npm run dev --workspace=@extractiq/web
npm run test --workspace=@extractiq/core
npm run build --workspace=@extractiq/infrastructure
```

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes, commit frequently
git add .
git commit -m "feat: add document filtering"

# 3. Push and create PR
git push origin feature/your-feature-name

# 4. CI automatically runs:
#    - Linting
#    - Type checking
#    - Unit tests
#    - Integration tests
#    - E2E tests
#    - Build verification

# 5. After approval, merge to main
# 6. Deploy to production (manual trigger)
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user authentication
fix: resolve WebSocket connection timeout
docs: update architecture documentation
refactor: restructure document processing
test: add integration tests for AI extraction
chore: update dependencies
```

---

## 🧪 Testing Strategy

### Test Pyramid

```
        /\
       /  \
      / E2E \        (10%) - Full user flows
     /______\
    /        \
   /Integration\     (30%) - Use cases with infrastructure
  /____________\
 /              \
/   Unit Tests   \   (60%) - Domain logic, pure functions
/________________\
```

### Unit Tests (packages/core)

**What we test:**
- Domain entities business rules
- Use case logic
- Value objects
- Pure functions

**Tools:** Jest, no infrastructure

**Example:**
```typescript
// packages/core/__tests__/unit/domain/document.entity.test.ts
describe('Document Entity', () => {
  it('should mark document as processing only if pending', () => {
    const doc = new Document('1', 'test.pdf', 'tenant-1', DocumentStatus.PENDING);

    doc.markAsProcessing();

    expect(doc.status).toBe(DocumentStatus.PROCESSING);
  });

  it('should throw error if trying to process non-pending document', () => {
    const doc = new Document('1', 'test.pdf', 'tenant-1', DocumentStatus.COMPLETED);

    expect(() => doc.markAsProcessing()).toThrow();
  });
});
```

### Integration Tests (packages/infrastructure)

**What we test:**
- Repository implementations with real database
- AI service with real API (or mocked)
- Queue service with Redis
- File storage

**Tools:** Jest, Docker test containers

**Example:**
```typescript
// packages/infrastructure/__tests__/integration/repositories/document.repository.test.ts
describe('DrizzleDocumentRepository', () => {
  let db: Database;
  let repo: DrizzleDocumentRepository;

  beforeAll(async () => {
    db = await setupTestDatabase();
    repo = new DrizzleDocumentRepository(db);
  });

  afterAll(async () => {
    await teardownTestDatabase(db);
  });

  it('should save and retrieve document', async () => {
    const doc = new Document('1', 'test.pdf', 'tenant-1', DocumentStatus.PENDING);

    await repo.save(doc);
    const retrieved = await repo.findById('1');

    expect(retrieved).toEqual(doc);
  });
});
```

### E2E Tests (e2e/)

**What we test:**
- Complete user workflows
- API endpoints
- WebSocket communication
- UI interactions

**Tools:** Playwright

**Example:**
```typescript
// e2e/document-upload.spec.ts
test('should upload and process document', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard/documents');

  // Upload document
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('./fixtures/test-invoice.pdf');

  // Wait for upload
  await expect(page.locator('text=Uploading...')).toBeVisible();
  await expect(page.locator('text=Processing...')).toBeVisible();

  // Wait for completion
  await expect(page.locator('text=Completed')).toBeVisible({ timeout: 60000 });

  // Verify extracted data
  await page.locator('text=test-invoice.pdf').click();
  await expect(page.locator('text=Invoice Number')).toBeVisible();
});
```

### Coverage Goals

| Package | Target Coverage | Current |
|---------|----------------|---------|
| @extractiq/core | 90% | TBD |
| @extractiq/infrastructure | 70% | TBD |
| @extractiq/web (API routes) | 80% | TBD |
| @extractiq/web (Frontend) | 60% | TBD |
| **Overall** | **75%** | **TBD** |

---

## 📝 Notes & Decisions

### Why Drizzle ORM over Prisma?

- **Lighter**: Smaller bundle size, no query engine
- **SQL-first**: Feels like writing SQL, not magic
- **Type-safe**: Full TypeScript support
- **Fast**: No extra runtime overhead
- **Migrations**: Simple, version-controlled SQL

### Why Next.js API Routes over Express?

- **Simpler deployment**: One service instead of two
- **Same framework**: No context switching
- **Built-in features**: File uploads, middleware, streaming
- **Vercel optimization**: If we switch to Vercel later
- **Cost**: One less deployment

### Why GPT-4o-mini over GPT-4?

- **95% cost reduction**: $0.001 vs $0.10 per document
- **Good quality**: Still excellent for structured extraction
- **Faster**: Lower latency than GPT-4
- **Scalable**: Can process 10x more docs for same cost

### Why BullMQ over Simple Queue?

- **Retry logic**: Automatic retries with exponential backoff
- **Monitoring**: Built-in metrics and job status tracking
- **Priority**: Can prioritize urgent documents
- **Durability**: Redis persistence ensures no job loss
- **Industry standard**: Battle-tested, widely used

### Why Keep WebSocket?

- **Real-time UX**: Users see progress immediately
- **Better experience**: No polling, instant updates
- **Low cost**: Minimal infrastructure overhead
- **Scalable**: Can handle thousands of concurrent connections

---

## 🔄 Rollback Plan

If migration encounters critical issues:

1. **Immediate rollback**: Git revert to last stable commit
2. **Database**: Restore from backup
3. **Deploy old version**: Use previous Docker image
4. **Communication**: Notify stakeholders

**Mitigation:**
- Test thoroughly in staging first
- Gradual rollout (feature flags)
- Keep old code until migration validated
- Database migrations are reversible

---

## 📚 References

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [BullMQ](https://docs.bullmq.io/)
- [OpenAI API](https://platform.openai.com/docs)

---

## ✅ Checklist for Team Members

Before starting development:
- [ ] Read this entire document
- [ ] Understand Clean Architecture principles
- [ ] Setup local development environment
- [ ] Run all tests successfully
- [ ] Review code examples in each package
- [ ] Understand dependency injection pattern
- [ ] Know how to use TodoWrite tool for tracking

---

**Last Updated:** 2025-10-18
**Document Version:** 1.0
**Status:** In Progress - Phase 1
