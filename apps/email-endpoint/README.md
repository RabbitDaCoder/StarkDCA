# StarkDCA Email Endpoint

Standalone email service deployed on **Vercel** as serverless functions. The backend calls this service via HTTP instead of sending emails directly.

## Architecture

```
Backend (Render) ──HTTP POST──▶ Email Endpoint (Vercel) ──▶ SMTP / SendGrid
```

## API Endpoints

| Method | Path              | Auth    | Description                         |
| ------ | ----------------- | ------- | ----------------------------------- |
| POST   | `/api/send-otp`   | API Key | Send OTP verification email         |
| POST   | `/api/send-email` | API Key | Send transactional emails (6 types) |
| GET    | `/api/health`     | None    | Health check                        |

### Authentication

All endpoints (except health) require an API key via:

- `Authorization: Bearer <API_KEY>` header, **or**
- `x-api-key: <API_KEY>` header

### POST `/api/send-otp`

```json
{
  "to": "user@example.com",
  "name": "John",
  "otp": "123456"
}
```

### POST `/api/send-email`

```json
{
  "type": "waitlist-welcome | signup-welcome | waitlist-confirmation | launch | custom",
  "to": "user@example.com",
  "name": "John",
  "position": 42,
  "subject": "Custom subject (for custom type)",
  "templateName": "announcement",
  "variables": { "title": "Hello", "content": "World" }
}
```

**Types:**

- `waitlist-welcome` — Welcome to waitlist
- `signup-welcome` — Account created
- `waitlist-confirmation` — Email verified + waitlist position (requires `position`)
- `launch` — Platform is live
- `custom` — Custom template (requires `subject`, optional `templateName` + `variables`)

### Response Format

```json
{
  "success": true,
  "data": { "sent": true, "to": "user@example.com" }
}
```

Error:

```json
{
  "success": false,
  "error": "Validation failed: to: Invalid email address",
  "code": "VALIDATION_ERROR"
}
```

## Setup

### 1. Install dependencies

```bash
cd apps/email-endpoint
npm install
```

### 2. Create `.env` from example

```bash
cp .env.example .env
```

Fill in:

- `EMAIL_SERVICE_API_KEY` — shared secret (set the same value in the backend's `EMAIL_SERVICE_API_KEY`)
- `SMTP_USER` / `SMTP_PASS` — your SMTP credentials (or `SENDGRID_API_KEY`)
- `FRONTEND_URL` — your frontend URL (for links in email templates)
- `ALLOWED_ORIGINS` — your backend's origin for CORS

### 3. Deploy to Vercel

```bash
cd apps/email-endpoint
npx vercel --prod
```

Set environment variables in Vercel dashboard:

| Variable                | Example                             |
| ----------------------- | ----------------------------------- |
| `EMAIL_SERVICE_API_KEY` | `your-random-secret-32chars`        |
| `EMAIL_PROVIDER`        | `nodemailer` or `sendgrid`          |
| `SMTP_HOST`             | `smtp.gmail.com`                    |
| `SMTP_PORT`             | `587`                               |
| `SMTP_SECURE`           | `false`                             |
| `SMTP_USER`             | `your-email@gmail.com`              |
| `SMTP_PASS`             | `your-app-password`                 |
| `SENDGRID_API_KEY`      | `SG.xxxxx` (if using SendGrid)      |
| `EMAIL_FROM_NAME`       | `StarkDCA`                          |
| `EMAIL_FROM_ADDRESS`    | `starkdca@gmail.com`                |
| `FRONTEND_URL`          | `https://starkdca-app.vercel.app`   |
| `ALLOWED_ORIGINS`       | `https://your-backend.onrender.com` |

### 4. Update Backend

In the backend's environment (Render dashboard), set:

```
EMAIL_SERVICE_URL=https://your-email-endpoint.vercel.app
EMAIL_SERVICE_API_KEY=same-secret-as-above
```

## Local Development

Run the email endpoint locally with Vercel CLI:

```bash
cd apps/email-endpoint
npx vercel dev --listen 3001
```

The backend defaults to `http://localhost:3001` for `EMAIL_SERVICE_URL` in development.

## Security

- API key validated with constant-time comparison (timing-attack safe)
- CORS restricts origins to configured allowlist
- Security headers (HSTS, X-Content-Type-Options, X-Frame-Options) via `vercel.json`
- Request payloads validated with Zod schemas
- No credentials stored in code — all via environment variables
