# Multi-stage build for Worker service
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package*.json ./
COPY packages/worker/package*.json ./packages/worker/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/db/package*.json ./packages/db/
RUN npm ci --workspace=@docuflow/worker --workspace=@docuflow/shared --workspace=@docuflow/db

# Build source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build packages
RUN npm run build --workspace=@docuflow/shared
RUN npm run build --workspace=@docuflow/db
RUN npm run build --workspace=@docuflow/worker

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 workeruser

# Copy built artifacts
COPY --from=builder --chown=workeruser:nodejs /app/packages/worker/dist ./packages/worker/dist
COPY --from=builder --chown=workeruser:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=workeruser:nodejs /app/packages/db/dist ./packages/db/dist
COPY --from=builder --chown=workeruser:nodejs /app/packages/worker/package*.json ./packages/worker/
COPY --from=builder --chown=workeruser:nodejs /app/packages/shared/package*.json ./packages/shared/
COPY --from=builder --chown=workeruser:nodejs /app/packages/db/package*.json ./packages/db/
COPY --from=builder --chown=workeruser:nodejs /app/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev --workspace=@docuflow/worker

USER workeruser

# Health check - check if worker is processing jobs
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('ioredis').createClient(process.env.REDIS_URL).ping().then(() => process.exit(0)).catch(() => process.exit(1))"

CMD ["node", "packages/worker/dist/index.js"]
