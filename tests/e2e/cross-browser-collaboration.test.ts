import { chromium, expect, firefox, test, webkit } from '@playwright/test';

test.describe('Cross-Browser Real-time Collaboration', () => {
  // Reduce timeout for faster execution
  test.setTimeout(45000); // 45 seconds should be plenty

  test.beforeEach(async () => {
    console.warn('This test requires:');
    console.warn('   PartyKit server running at http://127.0.0.1:1999');
    console.warn('   Dev server running at http://localhost:5173');
  });

  test('instructor in Chrome, attendee in Firefox', async () => {
    // Use unique room for this test
    const roomId = `chrome-firefox-${Date.now()}`;
    const baseUrl = `http://localhost:5173?room=${roomId}`;

    // Launch browsers in headless mode for speed
    const chromeBrowser = await chromium.launch();
    const firefoxBrowser = await firefox.launch();

    const chromeContext = await chromeBrowser.newContext();
    const firefoxContext = await firefoxBrowser.newContext();

    const instructorPage = await chromeContext.newPage();
    const attendeePage = await firefoxContext.newPage();

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

      console.warn('Chrome instructor and Firefox attendee connecting...');
      await instructorPage.waitForTimeout(1000);
      await attendeePage.waitForTimeout(1000);

      // Wait for connections to establish
      await expect(instructorPage.locator(`button:has-text("${roomId}")`)).toBeVisible({ timeout: 10000 });
      await expect(attendeePage.locator(`button:has-text("${roomId}")`)).toBeVisible({ timeout: 10000 });

      // Clear editor and test real-time content sync between Chrome and Firefox
      console.warn('Testing cross-browser content sync...');

      // Wait for Monaco Editor to be fully ready
      await instructorPage.waitForTimeout(2000);

      // For Firefox, try clicking on the editor area first to activate it
      const monacoEditor = instructorPage.locator('.monaco-editor').first();
      await expect(monacoEditor).toBeVisible({ timeout: 5000 });
      await monacoEditor.click();
      await instructorPage.waitForTimeout(500);

      // Use keyboard shortcuts directly on the page for Firefox compatibility
      await instructorPage.keyboard.press('Control+A'); // Select all
      await instructorPage.waitForTimeout(300);
      await instructorPage.keyboard.type('// Chrome instructor to Firefox attendee\nconst crossBrowser = "works!";');

      await attendeePage.waitForTimeout(1500);

      const attendeeEditor = attendeePage.locator('.monaco-editor');
      await expect(attendeeEditor).toContainText('Chrome instructor to Firefox attendee');
      await expect(attendeeEditor).toContainText('crossBrowser');

      console.warn('Cross-browser sync successful!');
    }
    finally {
      await chromeContext.close();
      await firefoxContext.close();
      await chromeBrowser.close();
      await firefoxBrowser.close();
    }
  });

  test('instructor in Chrome, attendee in Safari', async () => {
    const roomId = `chrome-safari-${Date.now()}`;
    const baseUrl = `http://localhost:5173?room=${roomId}`;

    const chromeBrowser = await chromium.launch();
    const safariBrowser = await webkit.launch();

    const chromeContext = await chromeBrowser.newContext();
    const safariContext = await safariBrowser.newContext();

    const instructorPage = await chromeContext.newPage();
    const attendeePage = await safariContext.newPage();

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

      console.warn('Chrome instructor and Safari attendee connecting...');
      await instructorPage.waitForTimeout(1000);
      await attendeePage.waitForTimeout(1000);

      // Wait for connections to establish
      await expect(instructorPage.locator(`button:has-text("${roomId}")`)).toBeVisible({ timeout: 10000 });
      await expect(attendeePage.locator(`button:has-text("${roomId}")`)).toBeVisible({ timeout: 10000 });

      // Test instructor presence detection
      await attendeePage.waitForTimeout(2000);
      const attendeeInstructorIcon = attendeePage.locator('[i-carbon-user-filled]');
      await expect(attendeeInstructorIcon).toBeVisible({ timeout: 5000 });

      // Test content sync
      console.warn('Testing Chrome to Safari content sync...');

      // Wait for Monaco Editor to be fully ready
      await instructorPage.waitForTimeout(2000);

      // Click on the editor area to activate it (consistent approach)
      const monacoEditor = instructorPage.locator('.monaco-editor').first();
      await expect(monacoEditor).toBeVisible({ timeout: 5000 });
      await monacoEditor.click();
      await instructorPage.waitForTimeout(500);

      // Use page-level keyboard for consistency
      await instructorPage.keyboard.press('Control+A'); // Clear previous content
      await instructorPage.waitForTimeout(300);
      await instructorPage.keyboard.type('// Chrome instructor to Safari attendee\nconst webkit = "supported!";');

      await attendeePage.waitForTimeout(1500);

      const attendeeEditor = attendeePage.locator('.monaco-editor');
      await expect(attendeeEditor).toContainText('Chrome instructor to Safari attendee');
      await expect(attendeeEditor).toContainText('webkit');

      console.warn('Chrome to Safari sync successful!');
    }
    finally {
      await chromeContext.close();
      await safariContext.close();
      await chromeBrowser.close();
      await safariBrowser.close();
    }
  });

  test('instructor in Firefox, attendee in Chrome', async () => {
    const roomId = `firefox-chrome-${Date.now()}`;
    const baseUrl = `http://localhost:5173?room=${roomId}`;

    const firefoxBrowser = await firefox.launch();
    const chromeBrowser = await chromium.launch();

    const firefoxContext = await firefoxBrowser.newContext();
    const chromeContext = await chromeBrowser.newContext();

    const instructorPage = await firefoxContext.newPage();
    const attendeePage = await chromeContext.newPage();

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

      console.warn('Firefox instructor and Chrome attendee connecting...');
      await instructorPage.waitForTimeout(1000);
      await attendeePage.waitForTimeout(1000);

      // Wait for connections
      await expect(instructorPage.locator(`button:has-text("${roomId}")`)).toBeVisible({ timeout: 10000 });
      await expect(attendeePage.locator(`button:has-text("${roomId}")`)).toBeVisible({ timeout: 10000 });

      // Test content sync from Firefox instructor to Chrome attendee
      console.warn('Testing Firefox to Chrome content sync...');

      // Wait for Monaco Editor to be fully ready in Firefox
      await instructorPage.waitForTimeout(2000);

      // For Firefox, click on the editor area to activate it
      const monacoEditor = instructorPage.locator('.monaco-editor').first();
      await expect(monacoEditor).toBeVisible({ timeout: 5000 });
      await monacoEditor.click();
      await instructorPage.waitForTimeout(500);

      // Use page-level keyboard for Firefox compatibility
      await instructorPage.keyboard.press('Control+A'); // Select all to clear previous content
      await instructorPage.waitForTimeout(300);
      await instructorPage.keyboard.type('// Firefox instructor to Chrome attendee\nconst gecko = "works too!";');

      await attendeePage.waitForTimeout(1500);

      const attendeeEditor = attendeePage.locator('.monaco-editor');
      await expect(attendeeEditor).toContainText('Firefox instructor to Chrome attendee');
      await expect(attendeeEditor).toContainText('gecko');

      console.warn('Firefox to Chrome sync successful!');
    }
    finally {
      await firefoxContext.close();
      await chromeContext.close();
      await firefoxBrowser.close();
      await chromeBrowser.close();
    }
  });
});
