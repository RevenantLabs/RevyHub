import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { AssetStatisticsPanel } from "@/features/asset-statistics/components/AssetStatisticsPanel";
import { copy } from "@/features/asset-statistics/copy";

describe("AssetStatisticsPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<AssetStatisticsPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<AssetStatisticsPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
