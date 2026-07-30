// Augments vitest's `expect` with the `toHaveNoViolations` matcher registered in
// tests/setup/vitest.setup.ts. The `export {}` makes this file a module so the
// `declare module "vitest"` block merges with vitest's real types instead of
// replacing them.
export {};

declare module "vitest" {
  interface Assertion {
    toHaveNoViolations(): void;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}
