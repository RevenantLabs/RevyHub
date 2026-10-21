import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://127.0.0.1:3088", browserName: "chromium", headless: true },
  webServer: { command: "npm run start -- -p 3088", cwd: process.cwd(), url: "http://127.0.0.1:3088", reuseExistingServer: false, timeout: 120000 }
});
