# Multi-stage build for API service
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/db/package*.json ./packages/db/
RUN npm ci --workspace=@extractiq/api --workspace=@extractiq/shared --workspace=@extractiq/db

# Build source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build packages
RUN npm run build --workspace=@extractiq/shared
RUN npm run build --workspace=@extractiq/db
RUN npm run build --workspace=@extractiq/api

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

# Copy built artifacts
COPY --from=builder --chown=apiuser:nodejs /app/packages/api/dist ./packages/api/dist
COPY --from=builder --chown=apiuser:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=apiuser:nodejs /app/packages/db/dist ./packages/db/dist
COPY --from=builder --chown=apiuser:nodejs /app/packages/api/package*.json ./packages/api/
COPY --from=builder --chown=apiuser:nodejs /app/packages/shared/package*.json ./packages/shared/
COPY --from=builder --chown=apiuser:nodejs /app/packages/db/package*.json ./packages/db/
COPY --from=builder --chown=apiuser:nodejs /app/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev --workspace=@extractiq/api

USER apiuser

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "packages/api/dist/index.js"]
