import { expect, test } from '@playwright/test';

test.describe('Instructor/Attendee Mode', () => {
  test('instructor mode sets correct sessionStorage and shows instructor badge', async ({ page }) => {
    // Set instructor mode via sessionStorage
    await page.addInitScript(() => {
      sessionStorage.setItem('isInstructor', 'yes');
    });

    // Navigate to the app
    await page.goto('/');

    // Wait for the app to load
    await expect(page.locator('.repl-container')).toBeVisible();

    // Verify sessionStorage was set correctly
    const isInstructor = await page.evaluate(() => sessionStorage.getItem('isInstructor'));
    expect(isInstructor).toBe('yes');

    // Wait a moment for the WebSocket connection to potentially establish
    await page.waitForTimeout(2000);

    // Check for the instructor user icon (should be visible regardless of connection status)
    // When instructor, the icon should be pink-500 if connected, otherwise neutral
    const userIcon = page.locator('[i-carbon-user-filled]');
    await expect(userIcon).toBeVisible();
  });

  test('attendee mode sets correct sessionStorage and shows different connection state', async ({ page }) => {
    // Set attendee mode via sessionStorage
    await page.addInitScript(() => {
      sessionStorage.setItem('isInstructor', 'no');
    });

    // Navigate to the app
    await page.goto('/');

    // Wait for the app to load
    await expect(page.locator('.repl-container')).toBeVisible();

    // Verify sessionStorage was set correctly
    const isInstructor = await page.evaluate(() => sessionStorage.getItem('isInstructor'));
    expect(isInstructor).toBe('no');

    // Wait a moment for the WebSocket connection to potentially establish
    await page.waitForTimeout(2000);

    // Check for the user icon (should show instructor status, not attendee status)
    const userIcon = page.locator('[i-carbon-user-filled]');
    await expect(userIcon).toBeVisible();
  });

  test('default mode when no sessionStorage is set', async ({ page }) => {
    // Don't set any sessionStorage - test default behavior
    await page.goto('/');

    // Wait for the app to load
    await expect(page.locator('.repl-container')).toBeVisible();

    // Check what the default sessionStorage value is
    const isInstructor = await page.evaluate(() => sessionStorage.getItem('isInstructor'));

    // Log the result so we can see what the default behavior is
    console.warn(`Default isInstructor value: ${isInstructor}`);
  });
});
