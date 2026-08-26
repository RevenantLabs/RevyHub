import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { AccountMergePreflightPanel } from "@/features/account-merge-preflight/components/AccountMergePreflightPanel";
import { copy } from "@/features/account-merge-preflight/copy";

describe("AccountMergePreflightPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<AccountMergePreflightPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<AccountMergePreflightPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
