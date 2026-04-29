import { defineConfig, devices } from "@playwright/test";
import baseConfig from "./playwright.config";

/**
 * Playwright config for E2E tests against production (app.mejoraok.com).
 * Usage: npx playwright test --config=playwright.prod.config.ts
 */
export default defineConfig({
  ...baseConfig,
  webServer: undefined, // No local dev server — testing remote
  retries: 1,
  use: {
    ...baseConfig.use,
    baseURL: "https://app.mejoraok.com",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
