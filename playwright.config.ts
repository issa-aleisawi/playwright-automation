import { defineConfig, devices } from '@playwright/test';

/**
 * Central Playwright configuration.
 *
 * Key decisions (be ready to explain these in the review):
 * - Two browser "projects" (Chrome + Firefox) satisfy the cross-browser requirement.
 *   UI tests run on both; API tests are browser-agnostic so they run in a third,
 *   dedicated project to avoid pointless duplication.
 * - globalSetup / globalTeardown provide the required suite start/finish logging.
 * - The HTML report is written to /reports so CI can upload it as an artifact.
 */
export default defineConfig({
  testDir: './tests',

  /* Fail the build on CI if test.only is accidentally left in the code. */
  forbidOnly: !!process.env.CI,

  /* Retry flaky tests on CI only. */
  retries: process.env.CI ? 1 : 0,

  /* Reporters: list gives readable console output, html is the shareable artifact. */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
  ],

  /* Required: global logging when the whole suite starts and finishes. */
  globalSetup: './src/utils/globalSetup.ts',
  globalTeardown: './src/utils/globalTeardown.ts',

  use: {
    /* Capture debugging evidence only when something goes wrong — keeps runs fast. */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chrome',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome', // real Google Chrome, not bundled Chromium
        /* Maximized window: --start-maximized only works when viewport is null,
           otherwise Playwright forces its own fixed viewport. deviceScaleFactor
           must be unset too — Playwright rejects it when viewport is null. */
        viewport: null,
        deviceScaleFactor: undefined,
        launchOptions: { args: ['--start-maximized'] },
        baseURL: 'https://www.saucedemo.com',
      },
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Firefox'],
        /* Firefox has no --start-maximized flag; a full-HD viewport is the
           standard equivalent for consistent full-size rendering. */
        viewport: { width: 1920, height: 1080 },
        baseURL: 'https://www.saucedemo.com',
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: 'https://simple-books-api.click',
      },
    },
  ],
});
