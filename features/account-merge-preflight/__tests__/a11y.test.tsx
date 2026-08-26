import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { AccountMergePreflightPanel } from "@/features/account-merge-preflight/components/AccountMergePreflightPanel";

describe("AccountMergePreflightPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<AccountMergePreflightPanel />);
    await expectNoAxeViolations(container);
  });
});
