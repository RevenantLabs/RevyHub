import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { ClaimablePredicateBuilderPanel } from "@/features/claimable-predicate-builder/components/ClaimablePredicateBuilderPanel";

describe("ClaimablePredicateBuilderPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<ClaimablePredicateBuilderPanel />);
    await expectNoAxeViolations(container);
  });
});
