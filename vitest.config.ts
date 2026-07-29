import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url))
    }
  },
  test: {
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts"],
      reporter: [
        ["text", { file: "coverage.txt", skipFull: false }],
        ["json-summary", { file: "coverage-summary.json" }]
      ],
      reportOnFailure: true
    }
  }
});
