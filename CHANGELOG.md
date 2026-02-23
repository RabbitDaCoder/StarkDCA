# Changelog

## v1.2.0 - 2026-02-23

### Added

- **On-chain execution** — Backend now makes real Starknet contract calls for plan creation, cancellation, and DCA execution via `starknet.service.ts` and the DCA engine ABI
- **New domain** — Migrated to `www.starkdca.xyz` with support email `support@starkdca.xyz`
- **Social links** — Updated to official Twitter [@StarkDCA_](https://x.com/StarkDCA_) and GitHub [RabbitDaCoder/StarkDCA](https://github.com/RabbitDaCoder/StarkDCA) across landing page, email templates, and README
- **Email footer** — All transactional email templates now include social links (Twitter, GitHub) and website/support contact in the footer
- **Frontend env vars** — Added `VITE_DCA_ENGINE_ADDRESS`, `VITE_USDT_TOKEN_ADDRESS`, `VITE_MBTC_TOKEN_ADDRESS`, `VITE_STARKNET_RPC_URL`
- **CI env vars** — Added `EMAIL_SERVICE_URL` and `EMAIL_SERVICE_API_KEY` to GitHub Actions workflow

### Fixed

- **CI/CD test failure** — `execution.service.test.ts` failed because config mock was missing `emailService` and email infrastructure wasn't mocked
- **Cross-origin refresh token cookie** — Changed `sameSite` from `strict` to `none` in production and broadened cookie `path` from `/api/v1/auth` to `/` so cookies are sent on cross-site requests (Vercel → Render)
- **Missing refresh token guard** — `/auth/refresh` now returns 401 `MISSING_REFRESH_TOKEN` instead of crashing Prisma with `undefined`
- **CORS** — Added `x-starknet-address` to allowed headers
- **Route prefix** — Frontend API URL now includes `/v1` suffix; removed redundant `/v1` from all frontend service paths to prevent double `/v1/v1/`
- **Interval case mismatch** — Backend schema now transforms interval to uppercase (`daily` → `DAILY`)
- **Plan status normalization** — Frontend normalizes plan status/interval to lowercase for UI badge rendering
- **Paginated response shape** — Frontend handles both `{ items: [...] }` and `{ data: [...], pagination: {...} }` response shapes
- **`timeUntil()` NaN** — Now accepts both ISO date strings and unix timestamps
- **Idempotency-Key** — Auto-generated for all POST requests via Axios interceptor

### Changed

- **RPC endpoint** — Switched from BlastAPI to Cartridge RPC (`api.cartridge.gg/x/starknet/sepolia`)
- **Default token addresses** — DCA schema defaults updated to deployed Sepolia contract addresses
- **`.env.example` files** — All example files updated with current variable names and correct defaults
- **`.env.production.example`** — Updated with new domain, email service vars, and Cartridge RPC
- **README.md** — Updated badges, contact section, env var tables, and added new frontend vars

---

## v1.1.0 - 2026-02-21

### Changed

- **Email architecture refactored** — Emails are now sent via a standalone Vercel-hosted service (`apps/email-endpoint`) instead of directly from the backend
- Backend email infrastructure replaced with an HTTP client (axios) that calls the email service — same interface, zero changes to auth/admin/waitlist/launch modules
- Backend config simplified: replaced 9 SMTP/SendGrid env vars with `EMAIL_SERVICE_URL` + `EMAIL_SERVICE_API_KEY`
- Removed `nodemailer` dependency from the backend

### Added

- New `apps/email-endpoint/` Vercel serverless service with:
  - `POST /api/send-otp` — OTP verification emails
  - `POST /api/send-email` — All transactional emails (waitlist welcome, signup, waitlist confirmation, launch, custom)
  - `GET /api/health` — Health check
  - API key authentication with constant-time comparison
  - Zod request payload validation
  - CORS + security headers
  - NodeMailer and SendGrid provider support
  - All HTML email templates migrated from backend

---

## v1.0.0 - 2026-02-20

### Added

- Initial public release
- User registration
- DCA strategy creation
- Dashboard
- Background worker
- Email system
