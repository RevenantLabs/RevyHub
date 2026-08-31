import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { AnchorDiscoveryPanel } from "@/features/anchor-discovery/components/AnchorDiscoveryPanel";
import { copy } from "@/features/anchor-discovery/copy";

describe("AnchorDiscoveryPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<AnchorDiscoveryPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<AnchorDiscoveryPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
