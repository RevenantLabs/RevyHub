import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url))
    }
  },
  test: {
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    // Component/a11y specs opt into jsdom individually via a
    // `// @vitest-environment jsdom` docblock; plain unit tests stay on
    // the faster "node" default.
    environment: "node",
    setupFiles: ["./tests/setup/vitest.setup.ts"]
  }
});
