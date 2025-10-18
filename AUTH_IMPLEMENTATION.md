# Authentication Implementation Guide

## Overview

Docuflow now has a fully typed JWT-based authentication system with user management, role-based access control, and comprehensive middleware protection.

## Architecture

### Database Schema

**Users Table** ([packages/db/src/schema/users.ts](packages/db/src/schema/users.ts))

```typescript
{
  id: uuid (primary key)
  email: string (unique)
  name: string
  passwordHash: string
  tenantId: uuid (nullable, references tenants)
  role: 'user' | 'admin'
  createdAt: timestamp
  updatedAt: timestamp
}
```

### API Schemas

**Zod Validation Schemas** ([packages/shared/src/api-schemas.ts](packages/shared/src/api-schemas.ts))

- `RegisterRequestSchema` - User registration
- `LoginRequestSchema` - User login
- `AuthResponseSchema` - Login/register response
- `VerifyTokenResponseSchema` - Token verification
- `UserSchema` - User object structure

### Auth Utilities

**JWT & Password Utilities** ([packages/api/src/utils/auth.ts](packages/api/src/utils/auth.ts))

```typescript
// Sign JWT token
signToken(payload: JWTPayload, expiresIn?: string): string

// Verify JWT token
verifyToken(token: string): JWTPayload

// Hash password with bcrypt
hashPassword(password: string): Promise<string>

// Compare password with hash
comparePassword(password: string, hash: string): Promise<boolean>

// Extract token from Authorization header
extractTokenFromHeader(authHeader: string | undefined): string | null
```

## API Endpoints

### POST /api/auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "tenantId": "uuid" // optional
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "tenantId": "uuid",
      "createdAt": "2024-10-13T10:00:00Z",
      "updatedAt": "2024-10-13T10:00:00Z"
    },
    "token": "jwt-token-here"
  }
}
```

**Error Responses:**

- `400` - Validation error (invalid email, password too short, etc.)
- `409` - User with email already exists
- `500` - Internal server error

### POST /api/auth/login

Authenticate and receive JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      /* user object */
    },
    "token": "jwt-token-here"
  }
}
```

**Error Responses:**

- `400` - Validation error
- `401` - Invalid credentials
- `500` - Internal server error

### POST /api/auth/verify

Verify JWT token and return user data.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      /* user object */
    }
  }
}
```

**Error Responses:**

- `401` - No token / Invalid token / Token expired
- `404` - User not found
- `500` - Internal server error

### POST /api/auth/logout

Logout user (client-side token removal).

**Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Middleware

### requireAuth

Protect routes that require authentication.

**Usage:**

```typescript
import { requireAuth } from './middleware/auth';

router.get('/protected', requireAuth, async (req, res) => {
  // req.user is available here
  const userId = req.user!.id;
  res.json({ userId });
});
```

**Attaches to Request:**

```typescript
req.user = {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string | null;
}

req.auth = {
  userId: string;
  email: string;
  role: string;
}
```

### requireAdmin

Require admin role (must be used after requireAuth).

**Usage:**

```typescript
router.delete('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  // Only admins can access this route
});
```

### requireTenant(tenantId)

Require specific tenant access (must be used after requireAuth).

**Usage:**

```typescript
router.get(
  '/tenant/:tenantId/data',
  requireAuth,
  (req, res, next) => {
    requireTenant(req.params.tenantId)(req, res, next);
  },
  async (req, res) => {
    // User has access to this tenant
  }
);
```

### optionalAuth

Attach user if token is valid, but don't fail if no token.

**Usage:**

```typescript
router.get('/public-data', optionalAuth, async (req, res) => {
  if (req.user) {
    // Show personalized data
  } else {
    // Show public data
  }
});
```

## Test Users

After running database seed, the following test accounts are available:

| Email                | Password    | Role  | Tenant           |
| -------------------- | ----------- | ----- | ---------------- |
| admin@extractiq.com   | admin123    | admin | None             |
| john@acme-legal.com  | password123 | user  | acme-legal       |
| sarah@techcorp.io    | password123 | user  | techcorp-finance |
| mike@startup-ops.com | password123 | user  | startup-ops      |

## Frontend Integration

### Using AuthContext

The frontend has an `AuthContext` that manages authentication state:

```typescript
// Login
const { login } = useAuth();
await login(email, password);

// Access user
const { user } = useAuth();
console.log(user?.email);

// Logout
const { logout } = useAuth();
logout();
```

### Protected Routes

The dashboard layout automatically protects routes:

```typescript
// In (dashboard)/layout.tsx
useEffect(() => {
  if (!isLoading && !user) {
    router.push('/login');
  }
}, [user, isLoading, router]);
```

## Environment Variables

Required environment variables:

```env
JWT_SECRET=your-secret-key-change-in-production
DATABASE_URL=postgresql://user:password@localhost:5433/dbname
```

## Security Features

1. **Password Hashing**: Bcrypt with salt rounds (10)
2. **JWT Expiration**: Tokens expire after 7 days
3. **Token Verification**: All protected routes verify token validity
4. **Role-Based Access**: Admin and user roles with middleware enforcement
5. **Tenant Isolation**: Users can be scoped to specific tenants
6. **Input Validation**: Zod schemas validate all inputs
7. **Error Messages**: Generic messages to prevent user enumeration

## Database Queries

### Check if user exists

```typescript
const [user] = await db
  .select()
  .from(users)
  .where(eq(users.email, email))
  .limit(1);
```

### Create user

```typescript
const [user] = await db
  .insert(users)
  .values({
    email,
    passwordHash: await hashPassword(password),
    name,
    tenantId: tenantId || null,
    role: 'user',
  })
  .returning();
```

### Get user by ID

```typescript
const [user] = await db
  .select()
  .from(users)
  .where(eq(users.id, userId))
  .limit(1);
```

## Testing the Auth Flow

### 1. Register a new user

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@extractiq.com",
    "password": "admin123"
  }'
```

Save the token from the response.

### 3. Verify token

```bash
curl -X POST http://localhost:3001/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Access protected route

```bash
curl -X GET http://localhost:3001/api/documents \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Migration Notes

### Database Changes Applied

1. Added `tenant_id` column to `users` table (nullable, references `tenants.id`)
2. Added `role` column to `users` table (default: 'user')
3. Added `updated_at` column to `documents` table

### Running Migrations

If you need to reapply the schema:

```bash
# Add columns manually
docker exec extractiq-postgres psql -U extractiq -d extractiq -c "
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id),
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';
"

# Seed test users
cd packages/db
npm run db:seed
```

## Next Steps

1. **Password Reset**: Implement password reset flow with email tokens
2. **Refresh Tokens**: Add refresh token support for long-lived sessions
3. **OAuth**: Add OAuth providers (Google, GitHub, etc.)
4. **2FA**: Implement two-factor authentication
5. **Session Management**: Track active sessions and allow revocation
6. **Rate Limiting**: Add rate limiting to auth endpoints
7. **Audit Logging**: Log authentication events for security monitoring

## Files Changed

### Created

- [packages/api/src/utils/auth.ts](packages/api/src/utils/auth.ts) - JWT and password utilities
- [packages/api/src/middleware/auth.ts](packages/api/src/middleware/auth.ts) - Auth middleware
- [packages/db/src/schema/users.ts](packages/db/src/schema/users.ts) - User schema with types

### Modified

- [packages/api/src/routes/auth.ts](packages/api/src/routes/auth.ts) - Fully typed auth routes
- [packages/shared/src/api-schemas.ts](packages/shared/src/api-schemas.ts) - Added auth schemas
- [packages/db/src/seed.ts](packages/db/src/seed.ts) - Added test users

## TypeScript Types

All auth functionality is fully typed:

```typescript
// From @extractiq/shared/api-schemas
import type {
  User,
  UserRole,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  VerifyTokenResponse,
} from '@extractiq/shared/api-schemas';

// From @extractiq/db/schema
import type { User as DBUser, NewUser } from '@extractiq/db/schema';

// JWT Payload
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}
```
