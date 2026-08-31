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
      // The text report is written to a file as well as stdout so CI can paste
      // it into the job summary, and `reportOnFailure` means a failing run
      // still reports coverage — which is when it is most worth seeing.
      reporter: [
        ["text", { file: "coverage.txt", skipFull: false }],
        ["json-summary", { file: "coverage-summary.json" }]
      ],
      reportOnFailure: true,
      include: ["features/**/lib/**", "features/**/schema.ts", "core/**/*.ts"],
      exclude: ["**/*.generated.ts", "**/fixtures/**", "**/__tests__/**"]
    }
  }
});
