import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { SponsoredReservesPanel } from "@/features/sponsored-reserves/components/SponsoredReservesPanel";
import { copy } from "@/features/sponsored-reserves/copy";

describe("SponsoredReservesPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<SponsoredReservesPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<SponsoredReservesPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
