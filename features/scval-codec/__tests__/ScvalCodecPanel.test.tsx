import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { ScvalCodecPanel } from "@/features/scval-codec/components/ScvalCodecPanel";
import { copy } from "@/features/scval-codec/copy";

describe("ScvalCodecPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<ScvalCodecPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<ScvalCodecPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
