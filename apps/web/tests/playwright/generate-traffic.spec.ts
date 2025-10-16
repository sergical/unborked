import { test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.describe('Generate Sale Page Traffic', () => {
  // Create 10 tests that each do 10 requests in parallel
  for (let batch = 0; batch < 10; batch++) {
    test(`batch ${batch + 1} - hit sale endpoint 10 times`, async ({ page }) => {
      test.setTimeout(180000); // 3 minutes per batch

      for (let i = 1; i <= 10; i++) {
        console.log(`[Batch ${batch + 1}, Request ${i}/10] Visiting /sale page`);

        await page.goto('/sale');

        // wait for page to load
        await page.waitForLoadState('networkidle');
      }

      console.log(`Batch ${batch + 1} complete!`);
    });
  }
});
