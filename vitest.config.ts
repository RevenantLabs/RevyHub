import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url))
    }
  },
  test: {
    // Node by default: @stellar/stellar-sdk 16.x crypto helpers (Keypair, signing)
    // depend on the Node "buffer" builtin, which the npm polyfill breaks under jsdom
    // (cross-realm Uint8Array). Component tests opt into jsdom per-file via the
    // "@vitest-environment jsdom" comment.
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"]
  }
});
