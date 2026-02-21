# Changelog

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
