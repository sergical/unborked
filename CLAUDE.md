# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Unborked is a full-stack e-commerce application consisting of:

- **Frontend**: React + Vite + TypeScript with React Router
- **Backend**: Node.js/Express API with PostgreSQL database
- **Testing**: Playwright for end-to-end tests
- **Monitoring**: Sentry integration for error tracking

## Architecture

### Dual-Version System

The application implements a feature-flagged dual-version architecture (V1 and V2):

- **V1**: Original design with traditional e-commerce UI
- **V2**: Cyberpunk-themed tech design with animated backgrounds

Version selection is controlled by the `UNBORKED_V2` feature flag via `FeatureFlagsProvider` (src/context/FeatureFlagsContext.tsx). The flag system integrates with Sentry's feature flag toolbar for runtime toggling.

### Frontend Structure (apps/web/)

- **App.tsx**: Contains `AppV1` and `AppV2` components with conditional rendering via `AppRenderer`
- **Context Providers**: AuthProvider, CartProvider, FeatureFlagsProvider wrap the application
- **Routing**: React Router handles navigation to pages (Home, Cart, Login, Register, ProductDetail, FeatureFlags)
- **V2 Components**: Located in src/components/v2/ with cyberpunk theme styling

### Backend Structure (apps/api/)

The Node.js server runs on port 3001 with the following routes:

- `/api/auth` - Authentication (login, register)
- `/api/products` - Product CRUD operations
- `/api/product-query` - Product search/filtering
- `/api/purchases` - Purchase history
- `/api/v2/cart` - V2 cart operations
- `/api/checkout` - Checkout processing with payment encryption
- `/api/payment-vault` - Secure payment data storage/retrieval
- `/api/flags` - Feature flag management

### Database

Uses Drizzle ORM with PostgreSQL. Schema defined in `apps/api/src/db/schema/`:

- `users` - User accounts
- `products` - Product catalog
- `purchases` - Purchase records
- `userCarts` - Shopping cart data
- `featureFlags` - Feature flag configurations
- `flagsTable` - Additional flag metadata

### Payment Processing

The application implements a secure payment vault system:

- Payment data is encrypted before storage
- API key authentication for vault access
- Decryption service handles secure payment retrieval
- See `apps/api/src/routes/paymentVault.ts` and `apps/api/src/routes/checkout.ts`

## Development Commands

### Root-level Turborepo Commands

```bash
turbo dev          # Start dev servers for all apps (frontend + backend)
turbo build        # Build all apps
turbo check-types  # Type-check all apps
turbo lint         # Lint all apps
pnpm install       # Install all workspace dependencies
```

### Frontend (apps/web/)

```bash
cd apps/web
pnpm dev           # Start Vite dev server (with API proxy to localhost:3001)
pnpm build         # Build for production
pnpm check-types   # Type-check with tsc
pnpm lint          # Run ESLint
pnpm preview       # Preview production build on port 4173
pnpm test:checkout # Run checkout stress test with Playwright
```

### Backend (apps/api/)

```bash
cd apps/api
npm run dev        # Start development server with nodemon + ts-node
npm run build      # Compile TypeScript and upload Sentry sourcemaps
npm start          # Run compiled server from dist/
npm run check-types # Type-check with tsc
npm run generate   # Generate Drizzle migrations
npm run migrate    # Run database migrations
npm run seed       # Seed database
npm run studio     # Open Drizzle Studio
```

### Testing

```bash
# From root or apps/web directory
pnpm test:checkout

# Run all Playwright tests from apps/web/tests/playwright directory
cd apps/web && npx playwright test

# Run tests without starting webserver (if already running)
NO_WEBSERVER=1 npx playwright test

# Control parallel workers (default: 5)
WORKERS=3 npx playwright test
```

## Key Configuration

### Turborepo

- This is a Turborepo monorepo using pnpm workspaces
- `turbo.json` at root defines task pipeline and caching strategy
- `pnpm-workspace.yaml` defines workspace structure (apps/\*)
- Root `package.json` has packageManager field set to `pnpm@10.17.0`

### Vite Dev Server

- Frontend runs on default Vite port with `/api` proxy to `http://localhost:3001`
- See apps/web/vite.config.ts for proxy configuration

### CORS

Backend configured to accept requests from `http://localhost:4173`

### Environment Variables

Both frontend and backend require environment configuration for:

- Database connection (PostgreSQL)
- Sentry DSN and organization settings
- API keys for payment processing
- Frontend URL (defaults to http://localhost:4173)

### Sentry Integration

- Frontend: Vite plugin in apps/web/vite.config.ts
- Backend: apps/api/src/instrument.ts initializes Sentry before Express
- Sourcemap uploads configured in both build processes
- Organization: `sergtech`, Projects: `unborked-frontend` (frontend), `unborked-server` (backend)

## Important Patterns

### Feature Flag Usage

```typescript
const { flags } = useFeatureFlags();
if (flags.UNBORKED_V2) {
  // Use V2 components
}
```

### Authentication

Uses JWT tokens stored in context (AuthContext). Backend validates via middleware.

### Cart Management

V2 cart is server-synchronized (`/api/v2/cart`), while V1 uses local state.

## Development Workflow

1. Install dependencies: `pnpm install` (from root)
2. Start all dev servers: `turbo dev` (starts both frontend and backend)
   - Or start individually: `cd apps/api && npm run dev` and `cd apps/web && pnpm dev`
3. For testing: `cd apps/web && pnpm preview` (starts on port 4173 for Playwright tests)
4. Database changes: `cd apps/api && npm run generate` → `npm run migrate`
5. Type-checking: `turbo check-types` (type-checks all packages with caching)

## Monorepo Structure

This is a Turborepo monorepo using pnpm workspaces:

```
.
├── apps/
│   ├── web/          # Frontend React + Vite application
│   └── api/          # Backend Node.js/Express server
├── turbo.json        # Turborepo task configuration
├── pnpm-workspace.yaml
└── package.json      # Root workspace package.json
```
