# StarkDCA — Production Deployment Checklist

## Environment Variable Audit Report

> Generated: 2026-02-19 | Based on full codebase scan

---

## BACKEND REQUIRED VARIABLES

| Variable | Purpose | Secret? | Example Format | Set On |
|---|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | **YES** | `postgresql://user:pass@host:5432/db` | Render env |
| `REDIS_URL` | Redis/Upstash connection (TLS) | **YES** | `rediss://default:token@host:6379` | Render env |
| `JWT_ACCESS_SECRET` | Signs JWT access tokens | **YES** | 64-char hex string (min 32 chars) | Render env |
| `JWT_REFRESH_SECRET` | Signs JWT refresh tokens | **YES** | 64-char hex string (min 32 chars) | Render env |
| `CORS_ORIGIN` | Allowed CORS origin (frontend URL) | No | `https://your-app.vercel.app` | Render env |
| `FRONTEND_URL` | Frontend URL for OAuth redirects | No | `https://your-app.vercel.app` | Render env |
| `GOOGLE_CLIENT_ID` | Google OAuth application ID | No | `xxxx.apps.googleusercontent.com` | Render env |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | **YES** | `GOCSPX-xxxx` | Render env |
| `GOOGLE_CALLBACK_URL` | Google OAuth redirect URI | No | `https://api.onrender.com/api/v1/auth/google/callback` | Render env |
| `SMTP_USER` | Email sender account | No | `email@gmail.com` | Render env |
| `SMTP_PASS` | Email sender password/app password | **YES** | Gmail App Password (16 chars) | Render env |

## BACKEND OPTIONAL VARIABLES (have defaults)

| Variable | Purpose | Default | Secret? |
|---|---|---|---|
| `PORT` | Server port | `4000` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `JWT_ACCESS_EXPIRY` | Access token TTL | `15m` | No |
| `JWT_REFRESH_EXPIRY` | Refresh token TTL | `7d` | No |
| `STARKNET_RPC_URL` | Starknet RPC endpoint | `https://starknet-sepolia.public.blastapi.io` | No |
| `DCA_CONTRACT_ADDRESS` | DCA smart contract address | `""` | No |
| `EXECUTOR_PRIVATE_KEY` | Starknet executor key | `""` | **YES** |
| `EXECUTOR_ADDRESS` | Starknet executor address | `""` | No |
| `PRICE_API_URL` | CoinGecko API base URL | `https://api.coingecko.com/api/v3` | No |
| `PRICE_API_KEY` | CoinGecko demo API key | `""` | Sensitive |
| `DCA_CRON_SCHEDULE` | Cron expression for DCA execution | `*/1 * * * *` | No |
| `ENABLE_CRON` | Enable/disable cron on this instance | `true` (unless `"false"`) | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `60000` | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | No |
| `PRICE_CACHE_TTL` | Price cache seconds | `60` | No |
| `PLAN_CACHE_TTL` | Plan cache seconds | `30` | No |
| `IDEMPOTENCY_TTL` | Idempotency cache seconds | `86400` | No |
| `DISTRIBUTED_LOCK_TTL` | Distributed lock seconds | `30` | No |
| `EMAIL_PROVIDER` | Email transport | `nodemailer` | No |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` | No |
| `SMTP_PORT` | SMTP port | `587` | No |
| `SMTP_SECURE` | SMTP TLS | `false` | No |
| `SENDGRID_API_KEY` | SendGrid key (if provider=sendgrid) | `""` | **YES** |
| `EMAIL_FROM_NAME` | Sender display name | `StarkDCA` | No |
| `EMAIL_FROM_ADDRESS` | Sender email | `noreply@starkdca.com` | No |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` | No |

## FRONTEND REQUIRED VARIABLES

| Variable | Purpose | Secret? | Example Format | Set On |
|---|---|---|---|---|
| `VITE_API_URL` | Backend API base URL | No (public) | `https://api.onrender.com/api` | Vercel env |

## FRONTEND OPTIONAL VARIABLES

| Variable | Purpose | Default | Secret? |
|---|---|---|---|
| `VITE_STARKNET_CHAIN_ID` | Starknet network | Declared in vite-env.d.ts | No (public) |
| `VITE_DCA_CONTRACT_ADDRESS` | Contract address | Declared in vite-env.d.ts | No (public) |

> **Note:** `VITE_STARKNET_CHAIN_ID` and `VITE_DCA_CONTRACT_ADDRESS` are declared in TypeScript types
> but only `VITE_API_URL` is actively used in runtime code (client.ts, auth.ts).

---

## Security Findings

### Hardcoded Secrets in Source Code
- **NONE FOUND** — All secrets are loaded via `process.env` through Zod-validated config.

### Variables That Must NOT Be Exposed to Frontend
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `GOOGLE_CLIENT_SECRET`
- `SMTP_PASS`, `SENDGRID_API_KEY`
- `EXECUTOR_PRIVATE_KEY`
- `DATABASE_URL`, `REDIS_URL`
- `PRICE_API_KEY`

### Variables Used But Never Defined
- **NONE** — All variables are defined in the Zod schema with either `.min(1)` (required) or `.default()` (optional).

### Production Safety Notes
- `process.env.ENABLE_CRON` is checked directly (not via Zod) in `server.ts:77` — this is fine, it's intentionally loose.
- `process.env.NODE_ENV` is also checked directly in `request-logger.ts:5` — safe, mirrors config.

---

## Production Deployment Checklist

### Pre-Deploy

- [ ] **Delete** `.env.production` from local before git push
- [ ] Verify `.env.production` is in `.gitignore`
- [ ] Run `npx prisma migrate deploy` against prod DB
- [ ] Test prod DB connection string locally: `DATABASE_URL=<prod_url> npx prisma db push --accept-data-loss`

### Render (Backend)

- [ ] Create Web Service from repo → `apps/backend`
- [ ] Set **Build Command**: `npm install && npx prisma generate && npx tsc`
- [ ] Set **Start Command**: `node dist/server.js`
- [ ] Set **all** env vars from `.env.production` in Render dashboard
- [ ] Set `NODE_ENV=production`
- [ ] Set `CORS_ORIGIN` and `FRONTEND_URL` to actual Vercel URL
- [ ] Set `GOOGLE_CALLBACK_URL` to `https://<render-domain>/api/v1/auth/google/callback`
- [ ] Set `ENABLE_CRON=false` on web service (or omit if running worker separately)
- [ ] Update Google Cloud Console: add Render callback URL to authorized redirect URIs

### Vercel (Frontend)

- [ ] Import repo → set root to `apps/frontend`
- [ ] Set **Build Command**: `npm run build`
- [ ] Set **Output Directory**: `dist`
- [ ] Set `VITE_API_URL` to `https://<render-domain>/api`
- [ ] Set `VITE_STARKNET_CHAIN_ID` to `SN_SEPOLIA` (or `SN_MAIN`)
- [ ] Set `VITE_DCA_CONTRACT_ADDRESS` to deployed contract

### Post-Deploy

- [ ] Verify landing page loads and stats API returns data
- [ ] Test signup flow (email + OTP)
- [ ] Test Google OAuth login flow
- [ ] Test waitlist join from landing page
- [ ] Verify CORS headers allow frontend origin
- [ ] Check Redis connection (rate limiting, OTP storage)
- [ ] Monitor error logs on Render dashboard
- [ ] Confirm `secure: true` cookie flag is active in production JWT refresh

### DNS / SSL

- [ ] Custom domain configured on Vercel (if needed)
- [ ] Custom domain configured on Render (if needed)
- [ ] SSL certificates auto-provisioned

---

## Files Created/Updated

| File | Purpose |
|---|---|
| `apps/backend/.env.production` | Live production env (DELETE BEFORE PUSH) |
| `apps/frontend/.env.production` | Frontend production env for Vercel |
| `apps/backend/.env.example` | Template for backend env vars |
| `apps/frontend/.env.example` | Template for frontend env vars |
| `.env.production.example` | Root-level production template (safe to commit) |
| `.gitignore` | Updated to exclude `.env.production` |
