import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url))
    }
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./core/testing/setup.ts"],
    include: [
      "features/**/__tests__/**/*.test.{ts,tsx}",
      "core/**/__tests__/**/*.test.{ts,tsx}"
    ],
    exclude: ["**/node_modules/**", "**/e2e/**", "**/.next/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["features/**/lib/**", "features/**/schema.ts", "core/**/*.ts"],
      exclude: ["**/*.generated.ts", "**/fixtures/**", "**/__tests__/**"]
    }
  }
});
