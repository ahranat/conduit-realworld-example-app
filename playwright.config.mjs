import { defineConfig, devices } from '@playwright/test';
import os from 'node:os';

// Bundled Chromium no longer supports macOS 13; use installed Chrome there.
const useSystemChrome = process.platform === 'darwin' && Number(os.release().split('.')[0]) <= 22;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://frontend:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'be.integration',
      testMatch: 'be.integration/**/*.spec.mjs',
      use: { baseURL: process.env.BE_BASE_URL },
    },
    {
      name: 'fe.integration',
      testMatch: 'fe.integration/**/*.spec.mjs',
      use: {
        ...devices['Desktop Chrome'],
        ...(useSystemChrome ? { channel: 'chrome' } : {}),
         baseURL: process.env.FE_BASE_URL,
      },
    },
    {
      name: 'e2e',
      testMatch: 'e2e/**/*.spec.mjs',
      use: {
        ...devices['Desktop Chrome'],
        ...(useSystemChrome ? { channel: 'chrome' } : {}),
      },
    },
  ]
});
