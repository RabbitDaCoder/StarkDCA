FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace root
COPY package.json package-lock.json* .npmrc ./
COPY tsconfig.base.json ./

# Copy shared types
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/shared-types/tsconfig.json packages/shared-types/
COPY packages/shared-types/src packages/shared-types/src

# Copy backend
COPY apps/backend/package.json apps/backend/
COPY apps/backend/tsconfig.json apps/backend/
COPY apps/backend/prisma apps/backend/prisma

# Install all deps
RUN npm install --workspace=packages/shared-types --workspace=apps/backend

# Generate Prisma client
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Build shared types then backend
COPY packages/shared-types packages/shared-types
COPY apps/backend apps/backend

RUN npm run build -w packages/shared-types
RUN npm run build -w apps/backend

# ─── Production image ────────────────────────────────────────

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/.npmrc ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/packages/shared-types/package.json ./packages/shared-types/
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "apps/backend/dist/server.js"]
