// jest-axe ships no bundled types, and DefinitelyTyped's @types/jest-axe lags behind
// the installed 11.x API, so this declares the subset this project actually calls.
// tsconfig.json remaps the "jest-axe" specifier to this file for type-checking only;
// the real package still resolves normally at runtime.
import type Axe from "axe-core";

export interface JestAxeConfigureOptions extends Axe.RunOptions {
  globalOptions?: Axe.Spec;
  impactLevels?: Array<"minor" | "moderate" | "serious" | "critical">;
}

export type AxeMatcherResult = {
  pass: boolean;
  message: () => string;
};

export function configureAxe(
  options?: JestAxeConfigureOptions
): (html: Element | Document | string, options?: JestAxeConfigureOptions) => Promise<Axe.AxeResults>;

export const axe: (
  html: Element | Document | string,
  options?: JestAxeConfigureOptions
) => Promise<Axe.AxeResults>;

export const toHaveNoViolations: {
  toHaveNoViolations(results: Axe.AxeResults): AxeMatcherResult;
};
