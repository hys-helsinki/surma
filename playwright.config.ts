import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

/**
 * Load the test environment. `override: true` makes .env.test win over any
 * variables already set in the shell, so tests and the web server below can
 * never accidentally point at the dev or production database. Next.js does
 * not override variables that are already set, so the server uses these too.
 */
dotenv.config({ path: '.env.test', override: true });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Recreate the test database schema once before the run. */
  globalSetup: './tests/global-setup.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /*
     * Pin browser locale and timezone so date formatting is deterministic.
     * The app's own locale is always "fi" unless a test navigates to /en/...
     * (next-i18next has localeDetection: false).
     */
    locale: 'fi-FI',
    timezoneId: 'Europe/Helsinki',

    /*
     * middleware.ts redirects plain-http requests to https when
     * NODE_ENV=production (i.e. `next start` on CI). Pretend we're behind an
     * https proxy so the tests can talk to the server over http.
     */
    extraHTTPHeaders: { 'x-forwarded-proto': 'https' },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /\.mobile\.spec\.ts$/,
    },
    /*
     * The player page has separate desktop and mobile views. Tests for the
     * mobile layout go in *.mobile.spec.ts files and run only here.
     */
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      testMatch: /\.mobile\.spec\.ts$/,
    },
  ],

  /* Run the app against the test database before starting the tests */
  webServer: {
    // CI tests the production build; locally the dev server is much faster.
    command: process.env.CI ? 'npm run build && npm run start' : 'npm run dev',
    // Wait for the port rather than a URL: the readiness check doesn't send
    // extraHTTPHeaders, so on CI it would get the https redirect and never pass.
    port: 3000,
    // Never reuse an already running server: it would be connected to the dev
    // database, not the test database.
    reuseExistingServer: false,
    timeout: 300_000,
    // Merged on top of process.env (which already contains .env.test).
    env: {
      E2E_DISABLE_EMAIL: '1',
      E2E_DISABLE_CLOUDINARY: '1',
    },
  },
});
