import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { OperationBudgetPlannerPanel } from "@/features/operation-budget-planner/components/OperationBudgetPlannerPanel";

describe("OperationBudgetPlannerPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<OperationBudgetPlannerPanel />);
    await expectNoAxeViolations(container);
  });
});
