import "@testing-library/jest-dom/vitest";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

function toHaveNoViolations(results: { violations: Array<{ id: string; help: string; nodes: Array<{ target: string[]; html: string; failureSummary: string }> }> }) {
  const pass = results.violations.length === 0;

  return {
    pass,
    message: () => {
      if (pass) return "No violations found";
      return results.violations.map((v) => {
        return `${v.id}: ${v.help}`;
      }).join("\n");
    }
  };
}

expect.extend({ toHaveNoViolations });

afterEach(() => {
  cleanup();
});
