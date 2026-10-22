import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { BatchOperationSummaryPanel } from "@/features/batch-operation-summary/components/BatchOperationSummaryPanel";
import { copy } from "@/features/batch-operation-summary/copy";

describe("BatchOperationSummaryPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<BatchOperationSummaryPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<BatchOperationSummaryPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
