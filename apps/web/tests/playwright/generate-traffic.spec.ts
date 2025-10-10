import { test } from '@playwright/test';

test.describe('Generate Sale Page Traffic', () => {
  test('hit sale endpoint 100 times', async ({ page }) => {
    for (let i = 1; i <= 100; i++) {
      console.log(`[${i}/100] Visiting /sale page`);

      await page.goto('/sale');

      // Small delay between requests
      await page.waitForTimeout(100);
    }

    console.log('Traffic generation complete!');
  });
});
