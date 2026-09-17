import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { TransactionTimeboundPlannerPanel } from "@/features/transaction-timebound-planner/components/TransactionTimeboundPlannerPanel";

describe("TransactionTimeboundPlannerPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<TransactionTimeboundPlannerPanel />);
    await expectNoAxeViolations(container);
  });
});
