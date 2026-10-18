import { defineConfig } from "@playwright/test";

/** Runs this slice's browser journeys independently of the shared test directory. */
export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  use: { baseURL: "http://localhost:3000", browserName: "chromium", headless: true },
  webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true, timeout: 120_000 }
});
