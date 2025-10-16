# Playwright Tests for Workshop

This directory contains a Playwright test used during the workshop.

## Generate Traffic Test

The traffic generation test (`generate-traffic.spec.ts`) simulates concurrent users accessing the sale page to demonstrate the N+1 query problem in Module 3.

### Running the Test

```bash
# Generate traffic to the sale page (used in Module 3)
pnpm traffic
```

This will run 10 test batches in parallel, each making 10 requests to the `/sale` page, for a total of 100 concurrent requests.

### What It Does

1. Navigates to `/sale` page
2. Waits for the page to load completely (networkidle)
3. Repeats 10 times per batch
4. Runs 10 batches in parallel

This load test is used in **Module 3** of the workshop to:

- Demonstrate the N+1 query problem under load
- Show slow API response times (p95 ~2500ms)
- Visualize the "comb" pattern in Sentry's distributed tracing
- Prove the performance improvement after optimization (2500ms → 50ms)

### Troubleshooting

If the test fails:

1. Make sure the application is running (`pnpm dev`)
2. Ensure the backend is running (`pnpm dev` in the api directory)
3. Verify the database has products with sale data (`pnpm seed`)
