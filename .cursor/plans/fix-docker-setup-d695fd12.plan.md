<!-- d695fd12-cb62-4262-a2f9-c604a11c0e67 c405ae2f-791a-4ce3-9fbf-450b930cffdd -->
# ExtractIQ Completion Plan

## Goals

- Harden security, complete authentication, protect document APIs
- Ensure observability and developer UX
- Ship a minimal, production-ready v1

## Assumptions

- Single Next.js app with background worker stays
- PostgreSQL/Redis infra running via docker-compose

## Milestones (Priority-Ordered)

### 1) Security Hardening (Critical)

- Add input validation (Zod) in API routes
- Add IP-based rate limiting for auth routes
- Enforce strong `JWT_SECRET` at startup
- Basic auth middleware for protected routes

Key files:

- `packages/web/src/app/api/**/route.ts`
- `packages/web/src/lib/middleware/auth.ts` (new)

### 2) Complete Authentication (High)

- Add refresh token endpoint and rotation
- Session store for refresh tokens (Redis)
- Logout all sessions (revoke)

Key files:

- `packages/web/src/app/api/auth/refresh/route.ts` (new)
- `packages/infrastructure/src/auth/token.service.impl.ts`
- `packages/infrastructure/src/database/repositories/session.repository.ts` (new)

### 3) Protect Document APIs (High)

- Apply auth middleware to `/api/documents*`
- Use tenant from token payload (remove hardcoded)

Key files:

- `packages/web/src/app/api/documents/route.ts`
- `packages/web/src/app/api/documents/[id]/route.ts`

### 4) File Upload Robustness (High)

- Enforce size/type limits
- Option A: Presigned upload to storage (future), keep current for v1

Key files:

- `packages/web/src/app/api/documents/route.ts`
- `packages/infrastructure/src/storage/*`

### 5) Observability & Ops (Medium)

- Add audit logging of auth events
- Add application metrics (requests, errors)

Key files:

- `packages/infrastructure/src/telemetry/*`
- `packages/web/src/lib/telemetry/*`

### 6) API Documentation (Medium)

- Lightweight OpenAPI doc for public endpoints
- Doc generation script

Key files:

- `packages/shared/src/api-schemas.ts`
- `OPENAPI.md` (new) or `/api/openapi` route

### 7) Product Completeness (Medium)

- Analytics endpoint(s)
- Webhook config endpoints

Key files:

- `packages/web/src/app/api/analytics/route.ts` (new)
- `packages/web/src/app/api/webhooks/*` (new)

### 8) Tests (Medium)

- Unit tests for core use-cases
- Integration tests for API routes (auth + documents)

Key files:

- `packages/core/__tests__/use-cases/*`
- `packages/web/src/__tests__/api/*`

### 9) Docs & Cleanup (Low)

- README: security & ops notes
- Rename residual “Docuflow” references

Key files:

- `README.md`, `LICENSE`, code references

## Risks & Mitigations

- Large uploads: mitigate with size/type checks now; presigned uploads later
- Token theft: solve with session storage + rotation + revoke
- Brute force: rate limit + lockout policy

## Deliverable Criteria (Go/No-Go)

- All document APIs require auth and tenant is enforced
- Login flow has rate limiting, sessions, rotation, revoke
- OpenAPI doc exists for v1 endpoints
- Tests cover core auth/doc flows
- Observability dashboards show request/error rates

### To-dos

- [ ] Add Zod input validation to all API routes
- [ ] Add IP-based rate limiting to auth endpoints
- [ ] Enforce strong JWT_SECRET at startup
- [ ] Create auth middleware and apply to protected routes
- [ ] Add refresh token endpoint with rotation
- [ ] Implement session storage for refresh tokens in Redis
- [ ] Add logout-all-sessions (revoke) endpoint
- [ ] Require auth on documents APIs and use tenant from token
- [ ] Add file size/type validation to upload API
- [ ] Add audit logging for auth events (success/failure)
- [ ] Add basic request/error metrics exposed to Prometheus
- [ ] Create minimal OpenAPI for public endpoints
- [ ] Add analytics API endpoint(s)
- [ ] Add webhook configuration endpoints
- [ ] Add unit tests for core use-cases (auth, documents)
- [ ] Add API integration tests for auth & documents
- [ ] Update README and remove remaining Docuflow references