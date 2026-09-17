import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { TransactionTimeboundPlannerPanel } from "@/features/transaction-timebound-planner/components/TransactionTimeboundPlannerPanel";
import { copy } from "@/features/transaction-timebound-planner/copy";

describe("TransactionTimeboundPlannerPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<TransactionTimeboundPlannerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<TransactionTimeboundPlannerPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
