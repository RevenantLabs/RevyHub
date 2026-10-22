import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { BatchOperationSummaryPanel } from "@/features/batch-operation-summary/components/BatchOperationSummaryPanel";
import { copy } from "@/features/batch-operation-summary/copy";

describe("BatchOperationSummaryPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<BatchOperationSummaryPanel />);
    await expectNoAxeViolations(container);
  });
  it("has no WCAG A/AA violations in its error state", async () => {
    const { container, user } = renderFeature(<BatchOperationSummaryPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("alert");
    await expectNoAxeViolations(container);
  });
});
