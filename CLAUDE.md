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

### Frontend Structure
- **App.tsx**: Contains `AppV1` and `AppV2` components with conditional rendering via `AppRenderer`
- **Context Providers**: AuthProvider, CartProvider, FeatureFlagsProvider wrap the application
- **Routing**: React Router handles navigation to pages (Home, Cart, Login, Register, ProductDetail, FeatureFlags)
- **V2 Components**: Located in src/components/v2/ with cyberpunk theme styling

### Backend Structure
The Node.js server (`unborked-node/`) runs on port 3001 with the following routes:

- `/api/auth` - Authentication (login, register)
- `/api/products` - Product CRUD operations
- `/api/product-query` - Product search/filtering
- `/api/purchases` - Purchase history
- `/api/v2/cart` - V2 cart operations
- `/api/checkout` - Checkout processing with payment encryption
- `/api/payment-vault` - Secure payment data storage/retrieval
- `/api/flags` - Feature flag management

### Database
Uses Drizzle ORM with PostgreSQL. Schema defined in `unborked-node/src/db/schema/`:
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
- See `unborked-node/src/routes/paymentVault.ts` and `unborked-node/src/routes/checkout.ts`

## Development Commands

### Frontend (Root Directory)
```bash
pnpm dev          # Start Vite dev server (with API proxy to localhost:3001)
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm preview      # Preview production build on port 4173
pnpm test:checkout # Run checkout stress test with Playwright
```

### Backend (unborked-node/)
```bash
npm run dev       # Start development server with nodemon + ts-node
npm run build     # Compile TypeScript and upload Sentry sourcemaps
npm start         # Run compiled server from dist/
npm run generate  # Generate Drizzle migrations
npm run migrate   # Run database migrations
```

### Testing
```bash
# Run Playwright tests
pnpm test:checkout

# Run all Playwright tests from tests/playwright directory
npx playwright test

# Run tests without starting webserver (if already running)
NO_WEBSERVER=1 npx playwright test

# Control parallel workers (default: 5)
WORKERS=3 npx playwright test
```

## Key Configuration

### Vite Dev Server
- Frontend runs on default Vite port with `/api` proxy to `http://localhost:3001`
- See vite.config.ts for proxy configuration

### CORS
Backend configured to accept requests from `http://localhost:4173` (preview server)

### Environment Variables
Both frontend and backend require environment configuration for:
- Database connection (PostgreSQL)
- Sentry DSN and organization settings
- API keys for payment processing
- Frontend URL (defaults to http://localhost:4173)

### Sentry Integration
- Frontend: Vite plugin in vite.config.ts
- Backend: Instrument.ts initializes Sentry before Express
- Sourcemap uploads configured in both build processes
- Organization: `buildwithcode`, Projects: `unborked` (frontend), `unborked-server` (backend)

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

1. Start backend server: `cd unborked-node && npm run dev`
2. Start frontend: `pnpm dev` (runs on Vite default port with proxy)
3. For testing: `pnpm preview` (starts on port 4173 for Playwright tests)
4. Database changes: `npm run generate` → `npm run migrate` in unborked-node/

## Monorepo Structure
This is a monorepo using pnpm workspaces with:
- Root: Frontend React application
- unborked-node/: Backend Node.js server
