import { expect, test } from '@playwright/test';

test.describe('Basic App Loading', () => {
  test('app loads successfully', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the main container to be visible
    await expect(page.locator('.repl-container')).toBeVisible();

    // Check that the page title or some basic element is present
    await expect(page.locator('nav')).toBeVisible();

    // Verify Monaco editor loads
    await expect(page.locator('.monaco-editor')).toBeVisible();
  });
});
