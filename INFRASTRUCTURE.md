# StarkDCA — Production Infrastructure Guide

> Simple, production-grade infrastructure for a pre-launch fintech platform.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Service Architecture](#service-architecture)
3. [Deployment (Render)](#deployment-render)
4. [Database & Migrations](#database--migrations)
5. [Redis (Upstash)](#redis-upstash)
6. [Worker Service](#worker-service)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Environment Variables](#environment-variables)
9. [Security Checklist](#security-checklist)
10. [Monitoring & Logging](#monitoring--logging)
11. [Versioning & Rollback](#versioning--rollback)
12. [Local Development](#local-development)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        INTERNET                                  │
└──────────────┬──────────────────────────────┬────────────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────┐       ┌──────────────────────────┐
│   Vercel (Frontend)  │       │   Render (Backend)       │
│   React + Vite SPA   │       │                          │
│   Static hosting     │◄─────►│  ┌────────────────────┐  │
│                      │ HTTPS │  │  Web Service (API)  │  │
└──────────────────────┘       │  │  Express + Prisma   │  │
                               │  │  Port 4000          │  │
                               │  │  ENABLE_CRON=false  │  │
                               │  └─────────┬──────────┘  │
                               │            │              │
                               │  ┌─────────▼──────────┐  │
                               │  │  Worker Service     │  │
                               │  │  DCA Cron Executor  │  │
                               │  │  node worker.js     │  │
                               │  └─────────┬──────────┘  │
                               └────────────┼──────────────┘
                                            │
                     ┌──────────────────────┼──────────────────────┐
                     │                      │                      │
                     ▼                      ▼                      ▼
          ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
          │  PostgreSQL      │  │  Redis (Upstash)  │  │  Starknet RPC    │
          │  Render Managed  │  │  Serverless Redis  │  │  Alchemy/Infura  │
          │  Auto-backups    │  │  TLS + REST        │  │                  │
          └──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Service Architecture

### Web Service (`server.ts`)

- **Role**: HTTP API, handles all client requests
- **Start command**: `node apps/backend/dist/server.js`
- **Key config**: `ENABLE_CRON=false` (cron handled by worker)
- **Health check**: `GET /api/v1/health`
- **Scaling**: Can run multiple instances (stateless)

### Worker Service (`worker.ts`)

- **Role**: Background job processor — executes DCA plans on schedule
- **Start command**: `node apps/backend/dist/worker.js`
- **Key behavior**: Runs `node-cron` every minute, checks for due DCA plans
- **Concurrency safety**: Uses distributed Redis locks (`cron:dca-executor`) with 55s TTL
- **Scaling**: Safe to run multiple instances (lock prevents duplicate execution)

### Shared Docker Image

Both services use the **same Docker image** built from the root `Dockerfile`. The only difference is the start command (`server.js` vs `worker.js`). This keeps builds simple and ensures code consistency.

---

## Deployment (Render)

### Prerequisites

1. GitHub repo connected to Render
2. Upstash Redis account (free tier is fine)
3. Domain configured (optional, Render provides `.onrender.com`)

### Quick Start

1. Push `render.yaml` to your repo
2. In Render Dashboard → **New** → **Blueprint** → Select your repo
3. Render reads `render.yaml` and creates:
   - `starkdca-api` (Web Service)
   - `starkdca-worker` (Worker Service)
   - `starkdca-db` (PostgreSQL)
4. Set the `sync: false` env vars manually in the Render dashboard
5. Deploy

### Deploy Flow

```
git push main
    │
    ├── GitHub Actions CI runs (lint → test → build)
    │
    └── Render auto-deploys:
         1. Builds Docker image (cached layers)
         2. Runs preDeployCommand: prisma migrate deploy
         3. Starts new container (zero-downtime rolling deploy)
         4. Health check passes → old container stopped
```

### Start Commands

| Service | Command                            | Env                 |
| ------- | ---------------------------------- | ------------------- |
| Web     | `node apps/backend/dist/server.js` | `ENABLE_CRON=false` |
| Worker  | `node apps/backend/dist/worker.js` | (default)           |

---

## Database & Migrations

### Strategy: `prisma migrate deploy`

- **Development**: `prisma migrate dev` — generates new migration files
- **Production**: `prisma migrate deploy` — applies pending migrations only
- **Never** run `prisma migrate dev` or `prisma db push` in production

### Migration Workflow

```bash
# 1. Local: Create a new migration
cd apps/backend
npx prisma migrate dev --name add_some_feature

# 2. Review the generated SQL in prisma/migrations/
# 3. Commit the migration file to git
# 4. Push to main → Render's preDeployCommand runs migrate deploy
```

### Render Integration

The `preDeployCommand` in `render.yaml` runs before each deploy:

```
npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma
```

This ensures migrations run **before** the new code starts.

### Manual Migration (Emergency)

```bash
DATABASE_URL="postgresql://..." ./scripts/migrate-deploy.sh
```

### Rollback

Prisma doesn't support automatic rollback. To revert a migration:

1. Create a new migration that undoes the changes
2. Or restore from Render's automatic PostgreSQL backups

---

## Redis (Upstash)

### Why Upstash?

- Serverless Redis (pay-per-request, generous free tier)
- TLS by default
- REST API fallback
- Works globally without managing Redis servers

### Setup

1. Create a database at [console.upstash.com](https://console.upstash.com)
2. Copy the `rediss://` connection string (note the double `s` for TLS)
3. Set `REDIS_URL` in both Render services

### Usage in StarkDCA

| Feature           | Key Pattern         | TTL                         |
| ----------------- | ------------------- | --------------------------- |
| Rate limiting     | `rl:*`              | Sliding window              |
| Distributed locks | `lock:*`, `cron:*`  | 55s (cron), 30s (execution) |
| OTP codes         | `otp:*`             | 10 min                      |
| Launch status     | `platform:launch:*` | Persistent                  |
| Idempotency       | `idempotency:*`     | 24h                         |

---

## Worker Service

### Architecture

```
worker.ts
  ├── connectDatabase()    # Prisma PostgreSQL
  ├── connectRedis()       # ioredis
  └── startDcaCron()       # node-cron (every minute)
        └── acquireDistributedLock("cron:dca-executor")
              └── processDuePlans()
                    └── for each plan:
                          ├── acquireDistributedLock("execution:plan:{id}")
                          ├── Prisma transaction (Serializable isolation)
                          ├── callContract() → Starknet
                          └── releaseLock()
```

### Safety Guarantees

1. **Distributed lock**: Only one worker processes plans at a time
2. **Serializable transactions**: Database-level isolation prevents races
3. **Idempotency**: Unique constraint on `[planId, executionNumber]` prevents double execution
4. **Graceful shutdown**: `SIGTERM` stops cron and disconnects cleanly

### Local Development

In local dev, the cron runs inside `server.ts` by default (`ENABLE_CRON` defaults to `true` unless explicitly set to `false`). No separate worker process needed.

---

## CI/CD Pipeline

### Pipeline: `.github/workflows/ci.yml`

```
PR / Push to main
    │
    ▼
  ┌─────────┐     ┌─────────┐     ┌──────────────┐     ┌────────────┐
  │  Lint &  │────►│  Test   │────►│ Docker Build │────►│  Deploy    │
  │TypeCheck │     │(Postgres│     │ Verification │     │(main only) │
  │          │     │ + Redis)│     │              │     │            │
  └─────────┘     └─────────┘     └──────────────┘     └────────────┘
```

| Stage      | What it does                                           |
| ---------- | ------------------------------------------------------ |
| **Lint**   | TypeScript type check + ESLint                         |
| **Test**   | Jest tests with real PostgreSQL + Redis containers     |
| **Build**  | Builds Docker image (not pushed — verification only)   |
| **Deploy** | Render auto-deploys from main (notification step only) |

### Branch Strategy

- `main` → production (auto-deploys to Render)
- Feature branches → PR with CI checks required
- No staging environment yet (add when needed)

---

## Environment Variables

See [`.env.production.example`](.env.production.example) for the complete list.

### Critical Secrets (never log, never commit)

| Variable               | Description                  |
| ---------------------- | ---------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string |
| `REDIS_URL`            | Upstash Redis TLS URL        |
| `JWT_ACCESS_SECRET`    | Access token signing secret  |
| `JWT_REFRESH_SECRET`   | Refresh token signing secret |
| `EXECUTOR_PRIVATE_KEY` | Starknet wallet private key  |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret          |
| `SMTP_PASS`            | Email service API key        |

### Render Env Var Tips

- Use `generateValue: true` for JWT secrets (auto-generates on first deploy)
- Use `fromDatabase` to auto-inject `DATABASE_URL`
- Set `sync: false` vars manually in the dashboard

---

## Security Checklist

### Application

- [x] Helmet.js (security headers)
- [x] CORS whitelist (specific origin, not `*`)
- [x] Rate limiting (Redis-backed)
- [x] Request body size limit (`10kb`)
- [x] Parameterized queries (Prisma ORM)
- [x] Password hashing (bcrypt, configurable rounds)
- [x] JWT with short-lived access tokens + refresh rotation
- [x] Input validation (Zod schemas on all endpoints)
- [x] Idempotency keys for write operations

### Infrastructure

- [x] Non-root Docker user (`starkdca:1001`)
- [x] TLS everywhere (Render provides HTTPS, Upstash uses `rediss://`)
- [x] PostgreSQL internal-only access (Render private network)
- [x] Secrets via environment variables (never in code)
- [x] Multi-stage Docker build (no dev deps in production image)
- [x] Tini as PID 1 (proper signal handling)
- [x] Docker health checks
- [x] `.dockerignore` excludes sensitive files

### Pre-Launch

- [ ] Enable Render's DDoS protection
- [ ] Set up Sentry or similar error tracking
- [ ] Rotate JWT secrets after initial deploy
- [ ] Verify Starknet RPC rate limits match your plan
- [ ] Test graceful shutdown with `docker stop`
- [ ] Review SMTP sending limits with email provider

---

## Monitoring & Logging

### Structured Logging (pino)

All logs are JSON-structured via `pino`:

```json
{
  "level": 30,
  "time": 1708000000000,
  "pid": 1,
  "msg": "StarkDCA backend running on port 4000",
  "port": 4000,
  "env": "production"
}
```

### Render Native Monitoring

- **Logs**: Available in Render Dashboard → Service → Logs
- **Metrics**: CPU, memory, response time (built-in)
- **Alerts**: Set up in Render Dashboard → Notifications

### Recommended Additions (Post-Launch)

| Tool                   | Purpose                                     | Priority |
| ---------------------- | ------------------------------------------- | -------- |
| **Sentry**             | Error tracking + alerts                     | High     |
| **Upstash QStash**     | Dead letter queue for failed DCA executions | Medium   |
| **Better Uptime**      | External uptime monitoring                  | Medium   |
| **Render Log Streams** | Ship logs to Datadog/Papertrail             | Low      |

### Key Metrics to Watch

- DCA execution success/failure rate (grep logs for `executionStatus`)
- API response times (p50, p95)
- Database connection pool usage
- Redis memory usage (Upstash dashboard)
- Worker service restart count

---

## Versioning & Rollback

### Versioning

- **API**: `v1` prefix (`/api/v1/...`) — bump to `v2` for breaking changes
- **App**: `package.json` version (`2.0.0`) — follow semver
- **Database**: Prisma migration timestamps (auto-incremented)
- **Docker**: Tagged by git SHA in CI (`starkdca:<sha>`)

### Rollback Strategy

#### Code Rollback (fastest)

```bash
# On Render: Dashboard → Service → Manual Deploy → select previous commit
# Or: revert the commit and push
git revert HEAD
git push origin main
```

#### Database Rollback

1. **Forward migration** (preferred): Create a new migration to undo changes
2. **Backup restore** (emergency): Render provides automatic daily PostgreSQL backups
   - Dashboard → Database → Backups → Restore

#### Rollback Checklist

1. Is the database schema change backward-compatible?
   - Yes → Just roll back the code
   - No → Roll back database first (restore backup), then roll back code
2. Stop the worker service first (prevents DCA executions during rollback)
3. Roll back web service
4. Re-enable worker
5. Verify health check passes

### Zero-Downtime Deploys

Render performs rolling deploys by default:

1. New container starts alongside old one
2. Health check must pass (`/api/v1/health`)
3. Traffic shifts to new container
4. Old container receives `SIGTERM` → graceful shutdown (10s timeout)

---

## Local Development

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL + Redis)
- npm (comes with Node)

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL + Redis
docker compose up -d  # or use local installations

# 3. Copy environment
cp .env.production.example apps/backend/.env
# Edit .env with local values (localhost URLs, test secrets)

# 4. Run migrations
cd apps/backend
npx prisma migrate dev

# 5. Start backend (with cron enabled by default)
npm run dev -w apps/backend

# 6. Start frontend
npm run dev -w apps/frontend
```

### Docker Compose (Local Dev)

Create a `docker-compose.yml` if needed:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: starkdca
      POSTGRES_PASSWORD: starkdca
      POSTGRES_DB: starkdca_dev
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  pgdata:
```

---

## File Reference

| File                                | Purpose                                   |
| ----------------------------------- | ----------------------------------------- |
| `Dockerfile`                        | Multi-stage production Docker build       |
| `render.yaml`                       | Render infrastructure blueprint           |
| `.env.production.example`           | Env var template with documentation       |
| `.github/workflows/ci.yml`          | CI/CD pipeline (lint → test → build)      |
| `scripts/migrate-deploy.sh`         | Manual migration script                   |
| `scripts/docker-entrypoint.sh`      | Optional Docker entrypoint with migration |
| `apps/backend/src/server.ts`        | Web service entry point                   |
| `apps/backend/src/worker.ts`        | Worker service entry point                |
| `apps/backend/prisma/schema.prisma` | Database schema                           |
