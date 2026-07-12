import { chromium, FullConfig } from '@playwright/test';

/**
 * Runs exactly once before the entire test suite.
 * 1. Suite-start logging (framework requirement)
 * 2. Bonus: logs into SauceDemo headlessly ONCE and saves the session
 *    to storageState.json, so TC_UI_004 skips UI login entirely.
 */
async function globalSetup(config: FullConfig): Promise<void> {
  console.log('='.repeat(60));
  console.log(`[GLOBAL SETUP] Test suite execution STARTED at ${new Date().toISOString()}`);
  console.log(`[GLOBAL SETUP] Projects: ${config.projects.map((p) => p.name).join(', ')}`);

  // --- Bonus: one-time headless authentication ---
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.saucedemo.com/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await page.waitForURL('**/inventory.html'); // confirm login actually succeeded
  await page.context().storageState({ path: 'storageState.json' });
  await browser.close();

  console.log('[GLOBAL SETUP] Auth session saved to storageState.json');
  console.log('='.repeat(60));
}

export default globalSetup;