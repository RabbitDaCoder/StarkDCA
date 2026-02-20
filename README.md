<p align="center">
  <img src="apps/frontend/src/assets/starkDCA.png" alt="StarkDCA Logo" width="120" />
</p>

<h1 align="center">StarkDCA</h1>
<p align="center">
  <strong>Automated Bitcoin Dollar-Cost Averaging on Starknet</strong>
</p>

<p align="center">
  <a href="https://x.com/DcaStark23076"><img src="https://img.shields.io/badge/𝕏-@DcaStark23076-000?style=flat-square&logo=x" alt="X / Twitter" /></a>
  <a href="mailto:Starkdca@gmail.com"><img src="https://img.shields.io/badge/Email-Starkdca%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email" /></a>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/Starknet-Mainnet%20%2F%20Sepolia-8B5CF6?style=flat-square" alt="Starknet" />
</p>

---

StarkDCA lets you **set-and-forget** a recurring Bitcoin buying strategy powered entirely by Starknet smart contracts. Deposit USDT, choose your schedule, and a backend scheduler executes purchases at defined intervals using on-chain contracts and oracle price feeds — all non-custodial.

## Features

- **Automated DCA** — Create daily, weekly, or monthly Bitcoin accumulation plans
- **Non-Custodial** — Your funds stay on-chain; only you can cancel or withdraw
- **Low Gas Fees** — Powered by Starknet's ZK-rollup for minimal transaction costs
- **Dark Mode** — Full light/dark theme support across the entire app
- **Real-Time Dashboard** — Live price feeds, plan analytics, and execution history
- **Email Notifications** — Waitlist confirmation, verification, and launch alerts
- **Waitlist System** — Early access signup with position tracking

---

## Architecture

```
┌─────────────────────┐     ┌──────────────┐     ┌──────────────────┐
│      Frontend       │────▶│   Backend    │────▶│  Starknet Chain  │
│  React / Vite       │     │  Express API │     │  Cairo Contracts │
│  TailwindCSS        │     │  Prisma ORM  │     │  Oracle + USDT   │
│  shadcn/ui + Radix  │     │  BullMQ      │     │  ERC-20 Tokens   │
│  Zustand            │     │  Redis       │     │                  │
└─────────────────────┘     └──────────────┘     └──────────────────┘
```

| Layer         | Description                                                                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**  | React SPA with TailwindCSS, shadcn/ui, glassmorphism design system, Starknet wallet integration, DCA plan management, and real-time price display. |
| **Backend**   | Express API with Prisma (PostgreSQL), Redis caching, BullMQ workers, email system, and Starknet.js for on-chain execution.                         |
| **Contracts** | Cairo smart contracts handling plan state, fund custody, and execution authorization.                                                              |

---

## Monorepo Structure

```
StarkDCA/
├── apps/
│   ├── frontend/           # React + Vite + TailwindCSS + shadcn/ui
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── landing/       # Landing page sections (Hero, Features, Team, …)
│   │   │   │   ├── ui/            # shadcn/ui primitives (Button, Card, Dialog, …)
│   │   │   │   └── Navbar.tsx
│   │   │   ├── features/dca/      # DCA feature module (components, hooks, types)
│   │   │   ├── layouts/           # DashboardLayout
│   │   │   ├── lib/               # cn() utility, ws-shim
│   │   │   ├── pages/             # Landing, Waitlist, Dashboard, Activity, Settings, Admin
│   │   │   ├── services/
│   │   │   │   ├── api/           # Axios client, DCA, price, waitlist endpoints
│   │   │   │   └── blockchain/    # Starknet wallet connect/disconnect
│   │   │   └── store/             # Zustand stores (auth, wallet, DCA)
│   │   ├── public/                # Static assets (favicon)
│   │   └── index.html             # Entry point with SEO meta tags
│   ├── backend/            # Node.js + Express + TypeScript + Prisma
│   │   ├── prisma/                # Schema & migrations
│   │   ├── src/
│   │   │   ├── config/            # Environment loader
│   │   │   ├── infrastructure/    # DB, Redis, Email, Logger
│   │   │   ├── middleware/        # Auth, rate-limit, idempotency, validation
│   │   │   ├── modules/           # admin, auth, dca, execution, price, waitlist
│   │   │   └── utils/             # Errors, pagination, distributed lock
│   │   └── jest.config.js
│   └── contracts/          # Cairo + Scarb + Starknet Foundry
│       ├── src/
│       │   ├── dca.cairo          # Main DCA contract
│       │   ├── interfaces.cairo   # IStarkDCA, IERC20, IOracle
│       │   └── lib.cairo
│       └── tests/
│           └── test_dca.cairo
├── packages/
│   └── shared-types/       # TypeScript types shared across apps
├── scripts/                # Docker entrypoint, migration scripts
├── CHANGELOG.md
├── Dockerfile
├── render.yaml
├── tsconfig.base.json
└── package.json            # npm workspaces root
```

---

## Tech Stack

| Layer     | Technology                                                                                                                       |
| --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Frontend  | React 18, Vite 5, TypeScript 5.4, TailwindCSS 3.4, shadcn/ui, Radix UI, Framer Motion, Lucide Icons, Zustand, Axios, Starknet.js |
| Backend   | Node.js, Express 4, TypeScript, Prisma (PostgreSQL), Redis, BullMQ, Winston, JWT, Jest                                           |
| Contracts | Cairo (edition 2024_07), Scarb, Starknet Foundry v0.35.0                                                                         |
| Shared    | `@stark-dca/shared-types` — TypeScript types shared across apps                                                                  |
| Infra     | Docker, Render (render.yaml), Vercel (frontend)                                                                                  |

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **npm** >= 10
- **PostgreSQL** 15+
- **Redis** 7+
- **Scarb** (latest) — [install](https://docs.swmansion.com/scarb/download.html)
- **Starknet Foundry** — [install](https://foundry-rs.github.io/starknet-foundry/getting-started/installation.html)

### Setup

```bash
# Clone the repo
git clone https://github.com/RabbitDaCoder/StarkDCA.git
cd StarkDCA

# Install all workspace dependencies
npm install

# Build shared types (required before other apps)
npm run build:shared

# Copy environment files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Run database migrations
cd apps/backend && npx prisma migrate deploy && cd ../..
```

### Running

```bash
# Start backend (port 4000)
npm run dev:backend

# Start frontend (port 3000, proxies /api to backend)
npm run dev:frontend
```

### Build

```bash
# Build everything (shared → backend → frontend)
npm run build
```

---

## Testing

### Backend (Jest)

```bash
npm run test:backend
```

### Smart Contracts (Starknet Foundry)

```bash
cd apps/contracts
snforge test
```

Tests cover: plan creation, execution, completion, cancellation, and authorization checks.

---

## Environment Variables

### Backend (`apps/backend/.env`)

| Variable               | Description                          |
| ---------------------- | ------------------------------------ |
| `PORT`                 | Server port (default: 4000)          |
| `NODE_ENV`             | `development` or `production`        |
| `DATABASE_URL`         | PostgreSQL connection string         |
| `REDIS_URL`            | Redis connection string              |
| `JWT_SECRET`           | Secret key for JWT tokens            |
| `STARKNET_RPC_URL`     | Starknet RPC endpoint                |
| `DCA_CONTRACT_ADDRESS` | Deployed DCA contract address        |
| `EXECUTOR_PRIVATE_KEY` | Private key for the executor account |
| `EXECUTOR_ADDRESS`     | Executor account address             |
| `SMTP_HOST`            | Email SMTP host                      |
| `SMTP_PORT`            | Email SMTP port                      |
| `SMTP_USER`            | Email SMTP username                  |
| `SMTP_PASS`            | Email SMTP password                  |

### Frontend (`apps/frontend/.env`)

| Variable                    | Description                              |
| --------------------------- | ---------------------------------------- |
| `VITE_API_URL`              | Backend API base URL                     |
| `VITE_STARKNET_CHAIN_ID`    | Target chain (`SN_SEPOLIA` or `SN_MAIN`) |
| `VITE_DCA_CONTRACT_ADDRESS` | DCA contract address for direct reads    |

---

## Deployment

### Smart Contracts

1. Build: `scarb build`
2. Declare: `starkli declare`
3. Deploy: `starkli deploy`
4. Update `DCA_CONTRACT_ADDRESS` in backend and frontend `.env`

### Backend

```bash
docker build -t starkdca-backend .
# Deploy to Render, Railway, Fly.io, or AWS ECS
```

### Frontend

```bash
npm run build:frontend
# Deploy apps/frontend/dist/ to Vercel, Netlify, or Cloudflare Pages
```

---

## Contributing

1. **Fork & branch** — Create a feature branch from `main`
2. **Follow conventions** — Run `npm run lint` and `npm run format` before committing
3. **Test** — Add tests for new logic; all tests must pass before merging
4. **PR** — Open a pull request with a clear description
5. **Review** — At least one approval required

---

## Team

| Name                                    | Role                                         | Links                                                                                                                                 |
| --------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Edeh Chinedu Daniel** (RabbitDaCoder) | Smart Contract Developer / Software Engineer | [𝕏](https://x.com/EdehChinedu20) · [LinkedIn](https://www.linkedin.com/in/edehchinedu20) · [GitHub](https://github.com/RabbitDaCoder) |
| **Muadh Ibrahim Adeleke**               | Graphic Designer                             | [𝕏](https://x.com/0xMuadh)                                                                                                            |
| **Ojile Clement**                       | UI/UX Designer                               | [𝕏](https://x.com/OjileC90873)                                                                                                        |
| **Ezedimbu Anthony Maduabuchukwu**      | Graphic Designer                             | [𝕏](https://x.com/AnthonyEzedimbu)                                                                                                    |

---

## Contact

- **Email:** [Starkdca@gmail.com](mailto:Starkdca@gmail.com)
- **X / Twitter:** [@DcaStark23076](https://x.com/DcaStark23076)

---

## License

MIT
