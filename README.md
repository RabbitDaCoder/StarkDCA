# StarkDCA — BTC Dollar Cost Averaging on Starknet

Automated BTC DCA protocol built on Starknet. Users deposit USDT, create recurring buy plans, and a backend scheduler executes purchases at defined intervals using on-chain smart contracts and oracle price feeds.

---

## Architecture

```
┌─────────────────────┐     ┌──────────────┐     ┌──────────────────┐
│      Frontend       │────▶│   Backend    │────▶│  Starknet Chain  │
│  React / Vite       │     │  Express API │     │  Cairo Contracts │
│  TailwindCSS        │     │  node-cron   │     │  Oracle + USDT   │
│  shadcn/ui + Radix  │     │  Starknet.js │     │  ERC-20 Tokens   │
│  Zustand            │     │  Winston     │     │                  │
└─────────────────────┘     └──────────────┘     └──────────────────┘
```

- **Frontend** — React SPA with TailwindCSS + shadcn/ui component library, Starknet wallet integration, DCA plan management dashboard, and real-time price display.
- **Backend** — Express API that stores plan metadata, schedules cron-based execution, and calls on-chain functions via Starknet.js.
- **Contracts** — Cairo smart contracts handling plan state, fund custody, and execution authorization.

---

## Monorepo Structure

```
stark-dca/
├── apps/
│   ├── frontend/          # React + Vite + TailwindCSS + shadcn/ui
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/            # shadcn/ui primitives (Button, Card, Dialog, …)
│   │   │   │   └── Navbar.tsx     # Top navigation with wallet dropdown
│   │   │   ├── features/
│   │   │   │   └── dca/           # Feature module
│   │   │   │       ├── components/    # SummaryCards, PlansTable, CreatePlanModal
│   │   │   │       ├── hooks/         # useDashboard orchestration hook
│   │   │   │       └── types.ts       # Feature-specific types
│   │   │   ├── layouts/           # DashboardLayout (sidebar + navbar)
│   │   │   ├── lib/               # cn() utility, formatters
│   │   │   ├── pages/             # Landing, Dashboard, Activity, Settings
│   │   │   ├── services/
│   │   │   │   ├── api/           # Axios client, DCA & price endpoints
│   │   │   │   └── blockchain/    # Starknet wallet connect/disconnect
│   │   │   └── store/             # Zustand stores (wallet, DCA)
│   │   ├── components.json        # shadcn/ui configuration
│   │   ├── tailwind.config.js     # Tailwind + shadcn theme
│   │   ├── postcss.config.js
│   │   └── vite.config.ts
│   ├── backend/           # Node.js + Express + TypeScript
│   │   ├── src/
│   │   │   ├── config/        # Environment loader
│   │   │   ├── controllers/   # Request handlers
│   │   │   ├── cron/          # DCA scheduler
│   │   │   ├── routes/        # API routes
│   │   │   ├── services/      # DCA, Price, Starknet
│   │   │   ├── utils/         # Logger
│   │   │   └── __tests__/     # Jest unit tests
│   │   └── jest.config.js
│   └── contracts/         # Cairo + Scarb + Starknet Foundry
│       ├── src/
│       │   ├── dca.cairo       # Main DCA contract
│       │   ├── interfaces.cairo # IStarkDCA, IERC20, IOracle
│       │   └── lib.cairo
│       └── tests/
│           └── test_dca.cairo  # Foundry tests
├── packages/
│   └── shared-types/      # TypeScript types shared across apps
│       └── src/index.ts
├── Dockerfile             # Backend production image
├── tsconfig.base.json     # Shared TS config
├── package.json           # npm workspaces root
└── README.md
```

---

## Local Development

### Prerequisites

- **Node.js** >= 20
- **npm** >= 10
- **Scarb** (latest) — [install](https://docs.swmansion.com/scarb/download.html)
- **Starknet Foundry** — [install](https://foundry-rs.github.io/starknet-foundry/getting-started/installation.html)

### Tech Stack

| Layer     | Technology                                                                 |
| --------- | -------------------------------------------------------------------------- |
| Frontend  | React 18, Vite 5, TypeScript 5.4, TailwindCSS 3.4, shadcn/ui, Radix UI, Lucide Icons, Zustand, Axios, Starknet.js 6.9 |
| Backend   | Node.js, Express 4, TypeScript, node-cron, Winston, Jest, Starknet.js 6.9 |
| Contracts | Cairo (edition 2024_07), Scarb, Starknet Foundry v0.35.0                  |
| Shared    | `@stark-dca/shared-types` — TypeScript types shared across apps            |

### Setup

```bash
# Clone the repo
git clone https://github.com/your-org/stark-dca.git
cd stark-dca

# Install all workspace dependencies
npm install

# Build shared types (required before other apps)
npm run build:shared

# Copy environment files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

### Running

```bash
# Start backend (port 4000)
npm run dev:backend

# Start frontend (port 3000, proxies /api to backend)
npm run dev:frontend

# Both in parallel (use two terminals)
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

Runs unit tests for:

- `DcaService` — plan creation, cancellation, execution logic
- `PriceService` — API fetching, caching, error fallback

### Smart Contracts (Starknet Foundry)

```bash
cd apps/contracts
snforge test
```

Tests cover:

- Creating a plan
- Executing a plan (with timestamp manipulation)
- Completing a plan after all executions
- Cancelling a plan
- Authorization checks (only owner cancels, only executor executes)

---

## Environment Variables

### Backend (`apps/backend/.env`)

| Variable               | Description                            |
| ---------------------- | -------------------------------------- |
| `PORT`                 | Server port (default: 4000)            |
| `NODE_ENV`             | `development` or `production`          |
| `STARKNET_RPC_URL`     | Starknet RPC endpoint                  |
| `DCA_CONTRACT_ADDRESS` | Deployed DCA contract address          |
| `EXECUTOR_PRIVATE_KEY` | Private key for the executor account   |
| `EXECUTOR_ADDRESS`     | Executor account address               |
| `PRICE_API_URL`        | CoinGecko (or compatible) API base URL |
| `PRICE_API_KEY`        | Optional API key for rate limits       |
| `DCA_CRON_SCHEDULE`    | Cron expression for plan scanning      |

### Frontend (`apps/frontend/.env`)

| Variable                    | Description                              |
| --------------------------- | ---------------------------------------- |
| `VITE_API_URL`              | Backend API base URL                     |
| `VITE_STARKNET_CHAIN_ID`    | Target chain (`SN_SEPOLIA` or `SN_MAIN`) |
| `VITE_DCA_CONTRACT_ADDRESS` | DCA contract address for direct reads    |

---

## Deployment Strategy

### Smart Contracts

1. Build with Scarb: `scarb build`
2. Declare on Starknet: `starkli declare`
3. Deploy with constructor args: `starkli deploy`
4. Update `DCA_CONTRACT_ADDRESS` in backend and frontend `.env` files

### Backend

1. Build: `npm run build:backend`
2. Docker: `docker build -t stark-dca-backend .`
3. Deploy to any container host (Railway, Fly.io, AWS ECS)
4. Ensure cron runs in a single instance to prevent duplicate executions

### Frontend

1. Build: `npm run build:frontend`
2. Output in `apps/frontend/dist/`
3. Deploy to any static host (Vercel, Netlify, Cloudflare Pages)
4. Configure environment variables via hosting platform

---

## Contribution Guide

1. **Fork & branch** — Create a feature branch from `main`
2. **Follow conventions** — Run `npm run lint` and `npm run format` before committing
3. **Test** — Add tests for new logic. All tests must pass before merging
4. **PR** — Open a pull request with a clear description of changes
5. **Review** — At least one approval required for merge

### Code Style

- TypeScript strict mode enabled
- ESLint + Prettier enforced at root level
- Cairo contracts follow standard library conventions

---

## License

MIT
