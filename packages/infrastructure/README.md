# @extractiq/infrastructure

**ExtractIQ Infrastructure Layer** - Implements core interfaces with real services

## Overview

This package contains all the infrastructure implementations for ExtractIQ. It implements the interfaces (ports) defined in `@extractiq/core` with real services like databases, AI APIs, queues, and storage.

## Architecture

```
@extractiq/infrastructure
├── database/         # Database (Drizzle ORM + PostgreSQL)
├── ai/              # AI services (OpenAI)
├── storage/         # File storage (Local/S3)
├── queue/           # Job queue (BullMQ)
├── auth/            # Authentication (bcrypt, JWT)
├── events/          # Notifications (Console/WebSocket)
└── config/          # Configuration
```

## Implementations

### Database (Drizzle ORM)

Implements repository interfaces with PostgreSQL:

```typescript
import { db, DrizzleDocumentRepository } from '@extractiq/infrastructure';

const documentRepo = new DrizzleDocumentRepository(db);
await documentRepo.save(document);
```

**Features:**
- Type-safe queries with Drizzle ORM
- Automatic migrations
- Connection pooling
- JSONB support for flexible data

### AI Service (OpenAI)

Implements AI extraction with GPT-4o-mini:

```typescript
import { OpenAIExtractorService } from '@extractiq/infrastructure';

const aiService = new OpenAIExtractorService();
const result = await aiService.extractText('/path/to/file.pdf');
```

**Features:**
- PDF text extraction (pdf-parse)
- Document type detection
- Structured data extraction
- Self-correction with validation feedback
- **Cost-optimized with GPT-4o-mini** (~95% cheaper than GPT-4)

### File Storage (Local)

Local filesystem storage implementation:

```typescript
import { LocalFileStorageService } from '@extractiq/infrastructure';

const storage = new LocalFileStorageService('./uploads');
await storage.upload(file, tenantId, documentId);
```

**Features:**
- Organized by tenant and document
- Safe filename handling
- Cleanup on deletion

### Queue Service (BullMQ)

Background job processing with BullMQ:

```typescript
import { BullMQQueueService } from '@extractiq/infrastructure';

const queue = new BullMQQueueService('document-processing');
await queue.add('process-document', { documentId });
```

**Features:**
- Automatic retries with exponential backoff
- Job prioritization
- Progress tracking
- Job history (last 100 completed, 500 failed)

### Auth Services

**Password Hashing (bcrypt):**

```typescript
import { BcryptPasswordHasherService } from '@extractiq/infrastructure';

const hasher = new BcryptPasswordHasherService();
const hash = await hasher.hash('password123');
const isMatch = await hasher.compare('password123', hash);
```

**Token Service (JWT):**

```typescript
import { JwtTokenService } from '@extractiq/infrastructure';

const tokenService = new JwtTokenService();
const tokens = tokenService.generateTokenPair({
  userId: '123',
  email: 'user@example.com',
  tenantId: 'tenant-1',
  role: 'user',
});
```

## Database Schema

### Documents Table

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  file_path TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  status document_status NOT NULL DEFAULT 'pending',
  type document_type,
  extracted_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  role user_role NOT NULL DEFAULT 'user',
  profile JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP
);
```

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/extractiq

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sk-...

# JWT
JWT_SECRET=your-secret-key
```

### Drizzle Kit Commands

```bash
# Generate migration
npm run db:generate

# Push schema to database
npm run db:push

# Open Drizzle Studio
npm run db:studio

# Run migrations
npm run db:migrate
```

## Mappers

Mappers convert between database rows and domain entities:

```typescript
import { DocumentMapper } from '@extractiq/infrastructure';

// Database row → Domain entity
const document = DocumentMapper.toDomain(row);

// Domain entity → Database row
const row = DocumentMapper.toPersistence(document);
```

**Why mappers?**
- Database schema != Domain model
- Allows schema changes without affecting business logic
- Clear separation of concerns

## Testing

Integration tests use real infrastructure:

```typescript
describe('DrizzleDocumentRepository', () => {
  let db: Database;
  let repo: DrizzleDocumentRepository;

  beforeAll(async () => {
    db = await setupTestDatabase();
    repo = new DrizzleDocumentRepository(db);
  });

  it('should save and retrieve document', async () => {
    const doc = Document.create('1', 'tenant-1', '/path', metadata);
    await repo.save(doc);
    const retrieved = await repo.findById('1');
    expect(retrieved?.id).toBe('1');
  });
});
```

## Dependencies

**Runtime:**
- `drizzle-orm` - Type-safe ORM
- `postgres` - PostgreSQL client
- `openai` - OpenAI API client
- `pdf-parse` - PDF text extraction
- `bullmq` - Job queue
- `ioredis` - Redis client
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT tokens

**Development:**
- `drizzle-kit` - Schema migrations
- `testcontainers` - Integration testing

## Future Enhancements

- [ ] S3 storage implementation
- [ ] WebSocket notification service
- [ ] Redis caching layer
- [ ] Database read replicas
- [ ] Connection pooling optimization
- [ ] Metrics and monitoring integration
