import { expect, test } from '@playwright/test';

test.describe('Real-time Collaboration', () => {
  test.beforeEach(async () => {
    // Log server requirements
    console.warn('This test requires:');
    console.warn('   PartyKit server running at http://127.0.0.1:1999');
    console.warn('   Dev server running at http://localhost:5173');
    console.warn('   Run: cd packages/party-kit && pnpm dev');
    console.warn('   Run: pnpm dev (in root)');
  });

  test('instructor and attendee real-time communication', async ({ browser }) => {
    // Create two browser contexts - one for instructor, one for attendee
    const instructorContext = await browser.newContext();
    const attendeeContext = await browser.newContext();

    // Set up instructor
    const instructorPage = await instructorContext.newPage();
    await instructorPage.addInitScript(() => {
      sessionStorage.setItem('isInstructor', 'yes');
    });

    // Set up attendee
    const attendeePage = await attendeeContext.newPage();
    await attendeePage.addInitScript(() => {
      sessionStorage.setItem('isInstructor', 'no');
    });

    try {
      // Navigate both to the app
      await Promise.all([
        instructorPage.goto('/'),
        attendeePage.goto('/'),
      ]);

      // Wait for both apps to load
      await Promise.all([
        expect(instructorPage.locator('.repl-container')).toBeVisible(),
        expect(attendeePage.locator('.repl-container')).toBeVisible(),
      ]);

      // Wait for WebSocket connections to establish
      console.warn('Waiting for WebSocket connections...');
      await instructorPage.waitForTimeout(3000);
      await attendeePage.waitForTimeout(3000);

      // Verify connection status in footer
      await test.step('Verify connection indicators', async () => {
        // Check instructor shows connected state
        const instructorConnectionBtn = instructorPage.locator('button:has-text("test-workshop")');
        await expect(instructorConnectionBtn).toBeVisible({ timeout: 5000 });

        // Check attendee shows connected state
        const attendeeConnectionBtn = attendeePage.locator('button:has-text("test-workshop")');
        await expect(attendeeConnectionBtn).toBeVisible({ timeout: 5000 });

        // Verify instructor icon status for attendee (should show instructor is online)
        const attendeeInstructorIcon = attendeePage.locator('[i-ph-broadcast-fill]');
        await expect(attendeeInstructorIcon).toBeVisible({ timeout: 5000 });
      });

      // Test real-time content synchronization
      await test.step('Test real-time content sync', async () => {
        console.warn('Testing content synchronization...');

        // Get Monaco editor on instructor side
        const instructorEditor = instructorPage.locator('.monaco-editor textarea').first();
        await instructorEditor.focus();

        // Type some content as instructor
        await instructorEditor.fill('// Hello from instructor!\nconst message = "real-time sync";');

        // Wait for sync
        await attendeePage.waitForTimeout(2000);

        // Verify content appears on attendee side
        const attendeeEditor = attendeePage.locator('.monaco-editor');
        await expect(attendeeEditor).toContainText('Hello from instructor!');
        await expect(attendeeEditor).toContainText('real-time sync');
      });

      // Test cursor and selection sync
      await test.step('Test cursor and selection sync', async () => {
        console.warn('Testing cursor and selection sync...');

        // Focus instructor editor and make a selection
        const instructorEditor = instructorPage.locator('.monaco-editor textarea').first();
        await instructorEditor.focus();

        // Select some text (this should trigger selection sync)
        await instructorPage.keyboard.press('Control+A');
        await attendeePage.waitForTimeout(1000);

        // Note: We can't easily verify the visual selection decoration in Playwright,
        // but we can verify that the selection event was triggered by checking console
        // or by looking for any visual indicators that might appear
      });

      // Test attendee reconnection
      await test.step('Test attendee disconnect and reconnect', async () => {
        console.warn('Testing attendee disconnect/reconnect...');

        // Find and click disconnect button on attendee
        const disconnectBtn = attendeePage.locator('button:has-text("test-workshop")');
        await disconnectBtn.click();

        // Wait for disconnection
        await attendeePage.waitForTimeout(1000);

        // Verify "Reconnect" button appears
        const reconnectBtn = attendeePage.locator('text="Reconnect"');
        await expect(reconnectBtn).toBeVisible();

        // Click reconnect
        await reconnectBtn.click();

        // Wait for reconnection
        await attendeePage.waitForTimeout(3000);

        // Verify connection is restored
        const connectionBtn = attendeePage.locator('button:has-text("test-workshop")');
        await expect(connectionBtn).toBeVisible({ timeout: 5000 });
      });

      // Test late joiner scenario
      await test.step('Test late joiner receives current state', async () => {
        console.warn('Testing late joiner sync...');

        // Create content as instructor first
        const instructorEditor = instructorPage.locator('.monaco-editor textarea').first();
        await instructorEditor.focus();
        await instructorEditor.fill('// State for late joiner\nconst existing = "content";');

        // Wait for sync
        await instructorPage.waitForTimeout(1000);

        // Create a new attendee (late joiner)
        const lateJoinerContext = await browser.newContext();
        const lateJoinerPage = await lateJoinerContext.newPage();
        await lateJoinerPage.addInitScript(() => {
          sessionStorage.setItem('isInstructor', 'no');
        });

        await lateJoinerPage.goto('/');
        await expect(lateJoinerPage.locator('.repl-container')).toBeVisible();

        // Wait for connection and sync
        await lateJoinerPage.waitForTimeout(3000);

        // Verify late joiner receives existing content
        const lateJoinerEditor = lateJoinerPage.locator('.monaco-editor');
        await expect(lateJoinerEditor).toContainText('State for late joiner');
        await expect(lateJoinerEditor).toContainText('existing');

        await lateJoinerContext.close();
      });
    }
    finally {
      // Clean up contexts
      await instructorContext.close();
      await attendeeContext.close();
    }
  });

  test('instructor disconnection notifies attendees', async ({ browser }) => {
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
        instructorPage.goto('/'),
        attendeePage.goto('/'),
      ]);

      await Promise.all([
        expect(instructorPage.locator('.repl-container')).toBeVisible(),
        expect(attendeePage.locator('.repl-container')).toBeVisible(),
      ]);

      // Wait for connections
      await instructorPage.waitForTimeout(3000);
      await attendeePage.waitForTimeout(3000);

      // Wait for instructor connection button to appear (confirms connection)
      await expect(instructorPage.locator('button:has-text("test-workshop")')).toBeVisible({ timeout: 10000 });
      await expect(attendeePage.locator('button:has-text("test-workshop")')).toBeVisible({ timeout: 10000 });

      // Additional wait for instructor status to propagate to attendee
      await attendeePage.waitForTimeout(2000);

      // Verify attendee sees instructor as connected (filled icon)
      const attendeeInstructorIcon = attendeePage.locator('[i-ph-broadcast-fill]');
      await expect(attendeeInstructorIcon).toBeVisible({ timeout: 5000 });

      // Disconnect instructor
      console.warn('Disconnecting instructor...');
      const instructorDisconnectBtn = instructorPage.locator('button:has-text("test-workshop")');
      await instructorDisconnectBtn.click();

      // Wait for disconnection to propagate
      await attendeePage.waitForTimeout(2000);

      // Verify attendee sees instructor as offline (unfilled icon)
      const attendeeInstructorOfflineIcon = attendeePage.locator('[i-ph-broadcast]:not([i-ph-broadcast-fill])');
      await expect(attendeeInstructorOfflineIcon).toBeVisible({ timeout: 5000 });
    }
    finally {
      await instructorContext.close();
      await attendeeContext.close();
    }
  });
});
