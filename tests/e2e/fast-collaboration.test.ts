import { expect, test } from '@playwright/test';

test.describe('Fast Real-time Collaboration Tests', () => {
  // Quick tests for rapid development
  test.setTimeout(20000); // 20 seconds should be plenty

  test.beforeEach(async () => {
    console.warn('This test requires:');
    console.warn('   PartyKit server running at http://127.0.0.1:1999');
    console.warn('   Dev server running at http://localhost:5173');
  });

  test('basic content sync between instructor and attendee', async ({ browser }) => {
    const roomId = `fast-test-${Date.now()}`;
    const baseUrl = `http://localhost:5173?room=${roomId}`;

    // Create two contexts within the same browser for speed
    const instructorContext = await browser.newContext();
    const attendeeContext = await browser.newContext();

    const instructorPage = await instructorContext.newPage();
    const attendeePage = await attendeeContext.newPage();

    // Set roles
    await instructorPage.addInitScript(() => {
      sessionStorage.setItem('isInstructor', 'yes');
    });
    await attendeePage.addInitScript(() => {
      sessionStorage.setItem('isInstructor', 'no');
    });

    try {
      // Navigate simultaneously
      await Promise.all([
        instructorPage.goto(baseUrl),
        attendeePage.goto(baseUrl),
      ]);

      // Wait for REPL to load
      await Promise.all([
        expect(instructorPage.locator('.repl-container')).toBeVisible(),
        expect(attendeePage.locator('.repl-container')).toBeVisible(),
      ]);

      // Quick connection wait
      await instructorPage.waitForTimeout(500);
      await attendeePage.waitForTimeout(500);

      // Wait for room connection
      await expect(instructorPage.locator(`button:has-text("${roomId}")`)).toBeVisible({ timeout: 8000 });
      await expect(attendeePage.locator(`button:has-text("${roomId}")`)).toBeVisible({ timeout: 8000 });

      // Test basic content sync
      const instructorEditor = instructorPage.locator('.monaco-editor textarea').first();
      await instructorEditor.focus();
      await instructorEditor.press('Control+A');
      await instructorEditor.fill('// Fast sync test\nconst speed = "light";');

      // Wait for sync
      await attendeePage.waitForTimeout(800);

      // Verify sync
      const attendeeEditor = attendeePage.locator('.monaco-editor');
      await expect(attendeeEditor).toContainText('Fast sync test');
      await expect(attendeeEditor).toContainText('speed');
    }
    finally {
      await instructorContext.close();
      await attendeeContext.close();
    }
  });

  test('file creation and switching sync', async ({ browser }) => {
    const roomId = `file-test-${Date.now()}`;
    const baseUrl = `http://localhost:5173?room=${roomId}`;

    const instructorContext = await browser.newContext();
    const attendeeContext = await browser.newContext();

    const instructorPage = await instructorContext.newPage();
    const attendeePage = await attendeeContext.newPage();

    await instructorPage.addInitScript(() => {
      sessionStorage.setItem('isInstructor', 'yes');
    });
    await attendeePage.addInitScript(() => {
      sessionStorage.setItem('isInstructor', 'no');
    });

    try {
      await Promise.all([
        instructorPage.goto(baseUrl),
        attendeePage.goto(baseUrl),
      ]);

      await Promise.all([
        expect(instructorPage.locator('.repl-container')).toBeVisible(),
        expect(attendeePage.locator('.repl-container')).toBeVisible(),
      ]);

      await instructorPage.waitForTimeout(500);
      await attendeePage.waitForTimeout(500);

      // Wait for connections
      await expect(instructorPage.locator(`button:has-text("${roomId}")`)).toBeVisible({ timeout: 8000 });
      await expect(attendeePage.locator(`button:has-text("${roomId}")`)).toBeVisible({ timeout: 8000 });

      // Test file creation - instructor creates a new file
      const addFileButton = instructorPage.locator('button[title*="Add"], button:has-text("+")').first();
      await addFileButton.click();

      // Wait for sync
      await attendeePage.waitForTimeout(1000);

      // Verify attendee sees the new file
      const attendeeFileList = attendeePage.locator('.file-selector .add');
      await expect(attendeeFileList).toBeVisible({ timeout: 5000 });
    }
    finally {
      await instructorContext.close();
      await attendeeContext.close();
    }
  });

  test('instructor presence indicator', async ({ browser }) => {
    const roomId = `presence-test-${Date.now()}`;
    const baseUrl = `http://localhost:5173?room=${roomId}`;

    const instructorContext = await browser.newContext();
    const attendeeContext = await browser.newContext();

    const instructorPage = await instructorContext.newPage();
    const attendeePage = await attendeeContext.newPage();

    await instructorPage.addInitScript(() => {
      sessionStorage.setItem('isInstructor', 'yes');
    });
    await attendeePage.addInitScript(() => {
      sessionStorage.setItem('isInstructor', 'no');
    });

    try {
      await Promise.all([
        instructorPage.goto(baseUrl),
        attendeePage.goto(baseUrl),
      ]);

      await Promise.all([
        expect(instructorPage.locator('.repl-container')).toBeVisible(),
        expect(attendeePage.locator('.repl-container')).toBeVisible(),
      ]);

      await instructorPage.waitForTimeout(500);
      await attendeePage.waitForTimeout(500);

      // Wait for connections
      await expect(instructorPage.locator(`button:has-text("${roomId}")`)).toBeVisible({ timeout: 8000 });
      await expect(attendeePage.locator(`button:has-text("${roomId}")`)).toBeVisible({ timeout: 8000 });

      // Check for instructor presence indicator on attendee page
      await attendeePage.waitForTimeout(1000);
      const instructorIcon = attendeePage.locator('[i-carbon-user-filled]');
      await expect(instructorIcon).toBeVisible({ timeout: 5000 });
    }
    finally {
      await instructorContext.close();
      await attendeeContext.close();
    }
  });
});
