# ─── StarkDCA Backend — Production Dockerfile ────────────────────────
# Multi-stage build: builder → production (slim)
# Used by both Web Service and Worker Service (different CMD at deploy time)

# ─── Stage 1: Builder ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# System deps for native modules (bcrypt, prisma)
RUN apk add --no-cache python3 make g++

# 1. Copy manifests first (maximizes Docker layer cache)
COPY package.json package-lock.json* .npmrc* ./
COPY tsconfig.base.json ./
COPY packages/shared-types/package.json packages/shared-types/tsconfig.json packages/shared-types/
COPY apps/backend/package.json apps/backend/tsconfig.json apps/backend/

# 2. Install ALL deps (dev + prod) for building
RUN npm ci --workspace=packages/shared-types --workspace=apps/backend

# 3. Copy Prisma schema and generate client
COPY apps/backend/prisma apps/backend/prisma
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma

# 4. Copy source and build
COPY packages/shared-types/src packages/shared-types/src
COPY apps/backend/src apps/backend/src

RUN npm run build -w packages/shared-types && \
    npm run build -w apps/backend

# 5. Prune dev dependencies for production image
RUN npm prune --production --workspace=packages/shared-types --workspace=apps/backend

# ─── Stage 2: Production ─────────────────────────────────────────────
FROM node:20-alpine AS production

# Security: add tini for proper PID 1 signal handling, openssl for Prisma
RUN apk add --no-cache tini curl openssl

WORKDIR /app

# Copy package manifests (needed for workspace resolution)
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy shared-types (compiled)
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/packages/shared-types/package.json ./packages/shared-types/

# Copy backend (compiled + Prisma)
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules

# Security: run as non-root
RUN addgroup -g 1001 -S starkdca && \
    adduser -S starkdca -u 1001 -G starkdca && \
    chown -R starkdca:starkdca /app

USER starkdca

# Environment
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

# Health check (Render also uses this)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:4000/api/v1/health || exit 1

# Use tini as PID 1 for proper signal forwarding
ENTRYPOINT ["/sbin/tini", "--"]

# Default: web server. Migrations + admin seed run automatically on startup.
CMD ["sh", "-c", "npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma && node apps/backend/prisma/seed-admin.js && node apps/backend/dist/server.js"]
