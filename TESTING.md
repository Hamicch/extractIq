# Docuflow Testing Guide

This document outlines the comprehensive testing infrastructure for Docuflow.

## Test Structure

```
docuflow/
├── packages/
│   ├── api/
│   │   └── src/__tests__/
│   │       ├── unit/           # Unit tests
│   │       ├── integration/    # Integration tests with testcontainers
│   │       ├── fixtures/       # Test data
│   │       └── setup.ts        # Global test setup
│   ├── worker/
│   │   └── src/__tests__/
│   │       ├── unit/
│   │       ├── fixtures/
│   │       └── setup.ts
│   └── web/
│       └── src/
│           ├── components/__tests__/  # Component tests
│           ├── hooks/__tests__/       # Hook tests
│           └── __tests__/
│               └── mocks/             # MSW handlers
├── e2e/                    # E2E tests with Playwright
└── .github/workflows/
    └── test.yml           # CI/CD pipeline
```

## Running Tests

### Backend Tests (API & Worker)

```bash
# Run all API tests
npm run test --workspace=@docuflow/api

# Run in watch mode
npm run test:watch --workspace=@docuflow/api

# Run with coverage
npm run test:ci --workspace=@docuflow/api

# Run worker tests
npm run test --workspace=@docuflow/worker
```

### Frontend Tests

```bash
# Run all frontend tests
npm run test --workspace=@docuflow/web

# Run in watch mode
npm run test:watch --workspace=@docuflow/web

# Run specific test file
npm run test --workspace=@docuflow/web FileUploadZone.test.tsx
```

### E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test e2e/document-upload.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Run only on specific browser
npx playwright test --project=chromium
```

## Test Categories

### Backend Unit Tests

Located in `packages/api/src/__tests__/unit/` and `packages/worker/src/__tests__/unit/`

**Examples:**
- `rate-limiter.test.ts` - Tests rate limiting middleware
- `file-validator.test.ts` - Tests file validation logic
- `cost-calculator.test.ts` - Tests cost calculation utilities

**What to test:**
- Middleware functions
- Validators
- Utility functions
- Cost calculators
- Webhook signature generation

### Backend Integration Tests

Located in `packages/api/src/__tests__/integration/`

Uses **testcontainers** for isolated database and Redis instances.

**Examples:**
- `document-processing.test.ts` - Full document workflow
- Tests multi-tenancy isolation
- Tests rate limiting with real Redis
- Tests WebSocket events
- Tests dead letter queue behavior

**Running integration tests:**
```bash
# Docker must be running for testcontainers
docker ps

# Run integration tests
npm run test --workspace=@docuflow/api
```

### Frontend Component Tests

Located in `packages/web/src/components/**/__tests__/`

Uses **React Testing Library** for component testing.

**Examples:**
- `FileUploadZone.test.tsx` - Tests drag/drop, file validation
- `DocumentStatusBadge.test.tsx` - Tests badge rendering, colors
- `DocumentCard.test.tsx` - Snapshot tests, click handlers

**Best practices:**
- Test user behavior, not implementation
- Use `screen` queries (getByRole, getByText)
- Avoid testing internal state
- Use `userEvent` for interactions

### Frontend Hook Tests

Located in `packages/web/src/hooks/__tests__/`

Tests custom React hooks in isolation.

**Examples:**
- `useWebSocket.test.ts` - Tests WebSocket connection, reconnection
- `useDocuments.test.ts` - Tests data fetching, caching
- `useUploadDocument.test.ts` - Tests mutations, optimistic updates

### E2E Tests

Located in `e2e/`

Uses **Playwright** for full user flows.

**Test suites:**
- `document-upload.spec.ts` - Upload → Process → View extraction
- `document-management.spec.ts` - Filter, search, edit, delete
- `accessibility.spec.ts` - Keyboard nav, ARIA labels, contrast

**Writing E2E tests:**
```typescript
test('should upload document', async ({ page }) => {
  await page.goto('/upload');
  await page.setInputFiles('input[type="file"]', 'test.pdf');
  await page.click('button:has-text("Upload")');
  await expect(page).toHaveURL('/documents');
});
```

## Mocking

### MSW (Mock Service Worker)

Used for mocking API calls in frontend tests.

**Location:** `packages/web/src/__tests__/mocks/`

**Setup:**
```typescript
// In jest.setup.js
import { server } from './__tests__/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Handlers:**
```typescript
// handlers.ts
export const handlers = [
  http.get('/api/documents', () => {
    return HttpResponse.json({ data: [...] });
  }),
];
```

## Coverage Thresholds

### Backend (API & Worker)
- **Lines:** 80%
- **Functions:** 80%
- **Branches:** 80%
- **Statements:** 80%

### Frontend
- **Lines:** 70%
- **Functions:** 70%
- **Branches:** 70%
- **Statements:** 70%

## CI/CD Pipeline

Tests run automatically on:
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

**GitHub Actions workflow:**
1. Backend tests (with Postgres + Redis services)
2. Frontend tests
3. E2E tests (with Playwright)
4. Type checking
5. Linting
6. Coverage upload to Codecov

**Viewing results:**
- Check the "Actions" tab in GitHub
- Coverage reports in Codecov
- Playwright test report as artifact

## Test Data & Fixtures

### Backend Fixtures
- `mockDocuments` - Sample document data
- `mockExtractions` - Extraction results
- `mockTenants` - Tenant configurations
- `mockWebhookEvents` - Webhook payloads

### Sample Files
Store test PDFs in `e2e/fixtures/`:
- `sample-invoice.pdf` - Valid invoice
- `large-document.pdf` - For upload progress testing
- `invalid-file.txt` - For error handling

## Debugging Tests

### Backend
```bash
# Add breakpoint with debugger statement
debugger;

# Run with Node inspector
node --inspect-brk node_modules/.bin/jest
```

### Frontend
```bash
# Use screen.debug() to see DOM
import { screen } from '@testing-library/react';
screen.debug();
```

### E2E
```bash
# Run in debug mode (pauses at each step)
npx playwright test --debug

# Generate code from browser interaction
npx playwright codegen http://localhost:3000
```

## Best Practices

1. **Write tests first** (TDD) when adding new features
2. **Test behavior, not implementation**
3. **Keep tests isolated** - no shared state between tests
4. **Use descriptive test names** - `should allow user to upload PDF`
5. **Mock external dependencies** - APIs, databases, third-party services
6. **Run tests before committing** - use pre-commit hooks
7. **Maintain test coverage** - don't let it drop below thresholds
8. **Update tests when refactoring** - tests should match current behavior

## Accessibility Testing

E2E tests include accessibility checks using `axe-playwright`:

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('should have no accessibility violations', async ({ page }) => {
  await injectAxe(page);
  await checkA11y(page);
});
```

**Checks:**
- ARIA labels
- Keyboard navigation
- Color contrast
- Focus management
- Semantic HTML

## Performance Testing

Monitor test execution time:

```bash
# Show slow tests
npm run test -- --verbose

# Run with coverage and check for slow tests
npm run test:ci
```

## Troubleshooting

### "Port already in use" (testcontainers)
```bash
# Stop all Docker containers
docker stop $(docker ps -aq)
```

### "Cannot find module" errors
```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Playwright browser issues
```bash
# Reinstall browsers
npx playwright install --force
```

## Further Reading

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/docs/)
- [Testcontainers Node](https://node.testcontainers.org/)
