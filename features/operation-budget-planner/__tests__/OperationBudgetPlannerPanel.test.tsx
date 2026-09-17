import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { OperationBudgetPlannerPanel } from "@/features/operation-budget-planner/components/OperationBudgetPlannerPanel";
import { copy } from "@/features/operation-budget-planner/copy";

describe("OperationBudgetPlannerPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<OperationBudgetPlannerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<OperationBudgetPlannerPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
