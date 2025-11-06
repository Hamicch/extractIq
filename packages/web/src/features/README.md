# Features Directory

This directory contains feature-based modules for the ExtractIQ application. Each feature is self-contained with its own components, hooks, types, and utilities.

## Philosophy

**Feature-Based Architecture** groups related functionality together rather than by technical type. This makes the codebase more maintainable and easier to understand.

### Benefits:
- **Cohesion**: Related code lives together
- **Scalability**: Easy to add/remove features
- **Team Collaboration**: Multiple developers can work on different features
- **Code Splitting**: Easy to lazy-load features
- **Testability**: Each feature can be tested in isolation

## Structure

```
features/
├── auth/              # Authentication (currently in app/(auth))
│   ├── components/    # Auth-specific UI components
│   ├── hooks/         # useAuth, useSession, etc.
│   ├── types/         # Auth types
│   └── index.ts       # Public API
│
├── documents/         # Document management
│   ├── components/    # Document UI components
│   │   ├── DocumentCard.tsx
│   │   ├── FileUploadZone.tsx
│   │   ├── ProcessingTimeline.tsx
│   │   ├── DocumentStatusBadge.tsx
│   │   ├── ConfidenceIndicator.tsx
│   │   └── index.ts
│   ├── hooks/         # useDocuments, useUpload, etc.
│   ├── types/         # Document types
│   └── index.ts       # Public API
│
├── analytics/         # Analytics & metrics
│   ├── components/    # Analytics UI components
│   │   ├── AnalyticsChart.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── MetricCard.tsx
│   │   └── index.ts
│   ├── hooks/         # useAnalytics, useMetrics, etc.
│   ├── types/         # Analytics types
│   └── index.ts       # Public API
│
└── shared/            # Shared across features
    ├── components/    # Reusable UI components
    │   ├── error-boundary.tsx
    │   ├── loading-skeleton.tsx
    │   └── index.ts
    ├── hooks/         # Shared hooks
    ├── utils/         # Shared utilities
    └── index.ts       # Public API
```

## Usage

### Importing from Features

Always import from the feature's index file (barrel export) for better encapsulation:

```typescript
// ✅ Good: Import from feature public API
import { DocumentCard, FileUploadZone } from '@/features/documents';
import { AnalyticsChart } from '@/features/analytics';
import { ErrorBoundary } from '@/features/shared';

// ❌ Bad: Direct import from component
import DocumentCard from '@/features/documents/components/DocumentCard';
```

### Creating a New Feature

1. Create feature directory structure:
```bash
mkdir -p features/my-feature/{components,hooks,types}
```

2. Create index.ts to export public API:
```typescript
// features/my-feature/index.ts
export * from './components';
export * from './hooks';
export * from './types';
```

3. Create components/index.ts for barrel exports:
```typescript
// features/my-feature/components/index.ts
export { default as MyComponent } from './MyComponent';
```

4. Use the feature:
```typescript
import { MyComponent } from '@/features/my-feature';
```

## Feature Dependencies

### Rules:
1. **Features should NOT depend on other features** (except `shared`)
2. **Features CAN depend on**:
   - `@/lib/*` (DI container, utilities)
   - `@extractiq/core` (use cases, domain)
   - `@extractiq/ui` (design system)
   - `shared` feature
3. **Shared functionality** goes in `features/shared`

```typescript
// ✅ Good
import { useApi } from '@/lib/hooks/useApi';
import { ListDocumentsUseCase } from '@extractiq/core';
import { Button } from '@extractiq/ui';
import { ErrorBoundary } from '@/features/shared';

// ❌ Bad: Feature depending on another feature
import { AnalyticsChart } from '@/features/analytics';  // DON'T do this in documents/
```

## Comparison with Old Structure

### Before (Type-Based):
```
components/
├── documents/
│   ├── DocumentCard.tsx
│   ├── FileUploadZone.tsx
│   └── ...
├── analytics/
│   ├── AnalyticsChart.tsx
│   └── ...
├── error-boundary.tsx
└── loading-skeleton.tsx

hooks/
├── useDocuments.ts
├── useAnalytics.ts
└── ...

types/
├── document.types.ts
├── analytics.types.ts
└── ...
```

### After (Feature-Based):
```
features/
├── documents/
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── index.ts
├── analytics/
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── index.ts
└── shared/
    ├── components/
    ├── hooks/
    └── index.ts
```

## Migration Status

- ✅ **documents**: Migrated to features/documents
- ✅ **analytics**: Migrated to features/analytics
- ✅ **shared**: Created features/shared
- ⏳ **auth**: Currently in app/(auth) - may stay there (Next.js route groups)

## Next Steps

1. Move hooks to respective features
2. Move types to respective features
3. Update imports across the codebase
4. Remove old components directory
5. Add feature-specific tests

## Testing

Each feature should have its own test directory:

```
features/documents/
├── components/
│   ├── __tests__/
│   │   ├── DocumentCard.test.tsx
│   │   └── FileUploadZone.test.tsx
│   └── ...
└── hooks/
    └── __tests__/
        └── useDocuments.test.ts
```

## Future Features

Potential features to add:

- `features/settings/` - User settings, preferences
- `features/billing/` - Subscription, payments (when revenue comes)
- `features/admin/` - Admin panel
- `features/integrations/` - Third-party integrations
- `features/notifications/` - Real-time notifications
