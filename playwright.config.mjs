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
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'be.integration',
      testMatch: 'be.integration/**/*.spec.mjs',
      use: { baseURL: 'http://localhost:3001' },
    },
    {
      name: 'fe.integration',
      testMatch: 'fe.integration/**/*.spec.mjs',
      use: {
        ...devices['Desktop Chrome'],
        ...(useSystemChrome ? { channel: 'chrome' } : {}),
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
  ],
  webServer: [
    {
      command: 'npm run dev -w backend',
      url: 'http://localhost:3001/',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev -w frontend -- --host 127.0.0.1 --port 3100 --strictPort',
      url: 'http://127.0.0.1:3100',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
