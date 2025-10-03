import { defineConfig, devices } from '@playwright/test';

const maybeWebServer = process.env.NO_WEBSERVER ? undefined : {
  command: 'npm run dev',
  url: 'http://localhost:4173',
  reuseExistingServer: !process.env.CI,
  timeout: 120 * 1000,
};

export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : Number(process.env.WORKERS || 5),
  reporter: [['html'], ['list']],
  
  // Each test is given 30 seconds to run
  timeout: 30000,
  
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  // Run tests in three browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Local development server handling (can be disabled via NO_WEBSERVER=1)
  ...(maybeWebServer ? { webServer: maybeWebServer } : {}),
});
