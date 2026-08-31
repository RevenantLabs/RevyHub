import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { ClaimablePredicateBuilderPanel } from "@/features/claimable-predicate-builder/components/ClaimablePredicateBuilderPanel";
import { copy } from "@/features/claimable-predicate-builder/copy";

describe("ClaimablePredicateBuilderPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<ClaimablePredicateBuilderPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<ClaimablePredicateBuilderPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
