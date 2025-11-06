# @extractiq/core

**ExtractIQ Core Business Logic** - Framework-agnostic domain layer

## Overview

This package contains the pure business logic for ExtractIQ, following Clean Architecture and Domain-Driven Design principles. It has **zero dependencies** on frameworks, databases, or external services.

## Architecture

```
@extractiq/core
├── domain/          # Domain entities and business rules
├── use-cases/       # Application services (orchestration)
├── ports/           # Interfaces for external dependencies
└── types/           # Common types and errors
```

### Key Principles

1. **Framework-Agnostic**: No Express, Next.js, or database dependencies
2. **Dependency Inversion**: Core defines interfaces, infrastructure implements them
3. **Testable**: 100% unit testable without mocks or infrastructure
4. **Pure Functions**: Business logic is predictable and side-effect free

## Domain Entities

### Document

Represents a document in the system with its lifecycle:

```typescript
const document = Document.create(id, tenantId, filePath, metadata);

document.markAsProcessing();
document.setType(DocumentType.INVOICE);
document.complete(extractedData);
```

**Business Rules:**
- Can only process pending documents
- Can only complete processing documents
- Can retry failed documents

### User

Represents a user with authentication and profile:

```typescript
const user = User.create(id, email, passwordHash, tenantId);

user.updateProfile({ firstName: 'John', lastName: 'Doe' });
user.recordLogin();
```

## Use Cases

Use cases orchestrate business workflows:

### Upload Document

```typescript
const useCase = new UploadDocumentUseCase(
  documentRepository,
  fileStorage,
  queueService
);

const result = await useCase.execute({
  file,
  tenantId,
  uploadedBy,
});
```

### Process Document

```typescript
const useCase = new ProcessDocumentUseCase(
  documentRepository,
  aiExtractor,
  notificationService
);

const result = await useCase.execute({ documentId });
```

### Login

```typescript
const useCase = new LoginUseCase(
  userRepository,
  passwordHasher,
  tokenService
);

const result = await useCase.execute({ email, password });
```

## Ports (Interfaces)

Core defines interfaces that infrastructure implements:

### Repositories

- `DocumentRepository` - Document persistence
- `UserRepository` - User persistence

### Services

- `AiExtractorService` - AI-powered document processing
- `FileStorageService` - File storage (local or S3)
- `QueueService` - Background job queue
- `NotificationService` - Real-time notifications
- `PasswordHasherService` - Password hashing
- `TokenService` - JWT token generation

## Error Handling

Uses `Result<T, E>` pattern for functional error handling:

```typescript
const result = await useCase.execute(request);

if (result.isSuccess) {
  const value = result.getValue();
} else {
  const error = result.getError();
}
```

**Domain Errors:**
- `NotFoundError` - Entity not found
- `ValidationError` - Invalid input
- `UnauthorizedError` - Authentication failed
- `ForbiddenError` - Authorization failed
- `ConflictError` - Duplicate entry
- `InvalidOperationError` - Business rule violation

## Testing

Run tests:

```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:ci      # CI mode with coverage
```

**Coverage Goal:** 90%

Example test:

```typescript
describe('Document Entity', () => {
  it('should mark document as processing only if pending', () => {
    const doc = Document.create('1', 'tenant-1', '/path', metadata);

    doc.markAsProcessing();

    expect(doc.status).toBe(DocumentStatus.PROCESSING);
  });

  it('should throw error if trying to process non-pending document', () => {
    const doc = Document.create('1', 'tenant-1', '/path', metadata);
    doc.markAsProcessing();

    expect(() => doc.markAsProcessing()).toThrow(InvalidOperationError);
  });
});
```

## Dependencies

**Runtime:**
- `uuid` - ID generation
- `zod` - Schema validation

**Development:**
- `typescript` - Type checking
- `jest` - Testing
- `ts-jest` - TypeScript support for Jest

## Usage in Other Packages

```typescript
// In @extractiq/infrastructure
import { DocumentRepository } from '@extractiq/core';

export class DrizzleDocumentRepository implements DocumentRepository {
  // Implementation using Drizzle ORM
}

// In @extractiq/web
import { UploadDocumentUseCase } from '@extractiq/core';

const useCase = container.resolve(UploadDocumentUseCase);
const result = await useCase.execute(request);
```

## Design Patterns

- **Entity Pattern** - Domain objects with identity
- **Value Object Pattern** - Immutable objects without identity
- **Repository Pattern** - Abstract data access
- **Use Case Pattern** - Application service layer
- **Result Pattern** - Functional error handling
- **Dependency Injection** - Loose coupling

## Future Enhancements

- [ ] Add domain events system
- [ ] Add specification pattern for complex queries
- [ ] Add aggregate root pattern
- [ ] Add domain services for complex business logic
- [ ] Add unit of work pattern for transactions
