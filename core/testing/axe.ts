import axe, { type AxeResults, type RunOptions } from "axe-core";
import { expect } from "vitest";

const DEFAULT_OPTIONS: RunOptions = {
  runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }
};

export async function analyze(container: Element, options: RunOptions = DEFAULT_OPTIONS) {
  return (await axe.run(container, options)) as AxeResults;
}

/**
 * Fails the test with a readable report when the rendered markup has any
 * WCAG A/AA violation. Every feature slice ships an `a11y.test.tsx` using this.
 */
export async function expectNoAxeViolations(
  container: Element,
  options: RunOptions = DEFAULT_OPTIONS
): Promise<void> {
  const results = await analyze(container, options);

  const report = results.violations
    .map((violation) => {
      const nodes = violation.nodes.map((node) => `      ${node.html}`).join("\n");
      return `  [${violation.impact ?? "unknown"}] ${violation.id}: ${violation.help}\n${nodes}`;
    })
    .join("\n");

  expect(
    results.violations.length,
    results.violations.length ? `Accessibility violations found:\n${report}` : ""
  ).toBe(0);
}
