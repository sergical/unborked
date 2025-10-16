# Unborked - E-commerce Performance Workshop

A full-stack e-commerce application built for demonstrating common frontend and backend performance issues, and how Sentry helps identify and fix them.

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + PostgreSQL (Drizzle ORM)
- **Monitoring**: Sentry
- **Monorepo**: Turborepo with pnpm workspaces

## Quick Start

### Prerequisites

- Node.js >= 16
- pnpm (`npm install -g pnpm@10.17.0`)
- PostgreSQL database

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

   - Copy `.env.example` to `.env` in both `apps/web` and `apps/api`
   - Configure your database URL and Sentry DSN

3. Run database migrations:

```bash
pnpm migrate
```

4. Seed the database:

```bash
pnpm seed
```

5. Start development servers:

```bash
pnpm dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Available Commands

```bash
pnpm dev          # Start all dev servers
pnpm build        # Build all apps
pnpm check-types  # Type-check all apps
pnpm lint         # Lint all apps
pnpm seed         # Seed database
pnpm migrate      # Run database migrations
```

## Project Structure

```
apps/
├── web/         # React frontend
└── api/         # Node.js backend
```

## Workshop Topics

This application demonstrates:

- N+1 query patterns
- Slow database queries
- Frontend performance issues
- Error tracking with Sentry
- Feature flag management
