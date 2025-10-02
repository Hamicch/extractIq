# @docuflow/db

Database layer for Docuflow using Drizzle ORM and PostgreSQL.

## Schema

### Tables

- **tenants** - Multi-tenant organizations
- **documents** - Uploaded documents with processing status
- **document_extractions** - Extracted structured data from documents
- **processing_audit_log** - Detailed audit trail of processing stages
- **api_keys** - API authentication keys per tenant
- **users** - User accounts (legacy, being phased out in favor of tenants)

### Indexes

- `documents_tenant_created_idx` - Fast document listing by tenant and creation date
- `documents_tenant_status_idx` - Filter documents by tenant and status
- `documents_filename_search_idx` - Full-text search on file names (GIN index)
- `audit_document_stage_idx` - Query audit logs by document and stage
- `api_keys_hash_idx` - Fast API key lookup

## Setup

### 1. Start PostgreSQL

```bash
docker-compose up -d postgres
```

### 2. Set Environment Variable

```bash
export DATABASE_URL="postgresql://docuflow:docuflow_dev@localhost:5433/docuflow"
```

Or create a `.env` file in the project root.

### 3. Generate Migrations

```bash
npm run db:generate
```

This creates migration SQL files in `./drizzle` directory.

### 4. Push Schema to Database

```bash
npm run db:push
```

This applies the schema directly to the database (for development).

### 5. Seed Test Data

```bash
npm run db:seed
```

This creates:
- 3 test tenants (acme-legal, techcorp-finance, startup-ops)
- 6 API keys (2 per tenant)
- 50 sample documents with realistic data
- Extractions for completed documents
- Audit logs for all processing stages

## Test API Keys

After seeding, use these API keys for testing:

```
acme-legal:        acme_test_key_123
techcorp-finance:  techcorp_test_key_456
startup-ops:       startup_test_key_789
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate migrations from schema |
| `npm run db:push` | Push schema to database (dev) |
| `npm run db:migrate` | Run migrations (production) |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |
| `npm run db:seed` | Seed database with test data |

## Drizzle Studio

View and edit your database with a visual GUI:

```bash
npm run db:studio
```

Then open http://localhost:4983

## TypeScript Types

All tables export TypeScript types:

```typescript
import {
  Tenant,
  NewTenant,
  Document,
  NewDocument,
  DocumentExtraction,
  ProcessingAuditLog
} from '@docuflow/db';

// Use in your application
const tenant: Tenant = { ... };
const newDoc: NewDocument = { ... };
```

## Querying

```typescript
import { db } from '@docuflow/db';
import { documents, tenants } from '@docuflow/db';
import { eq, and, desc } from 'drizzle-orm';

// Get documents for a tenant
const tenantDocs = await db
  .select()
  .from(documents)
  .where(eq(documents.tenantId, tenantId))
  .orderBy(desc(documents.createdAt));

// Join with tenant
const docsWithTenant = await db
  .select()
  .from(documents)
  .leftJoin(tenants, eq(documents.tenantId, tenants.id))
  .where(eq(documents.status, 'completed'));
```

## Migrations

Production migrations:

```bash
# Generate migration
npm run db:generate

# Review the SQL in ./drizzle/*.sql

# Run migration
npm run db:migrate
```

## Down Migrations

Drizzle Kit generates both up and down migrations. To rollback:

```bash
# Run the down migration SQL manually
psql $DATABASE_URL -f ./drizzle/0001_down.sql
```

## License

MIT
