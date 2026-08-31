import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { TradeAggregationViewerPanel } from "@/features/trade-aggregation-viewer/components/TradeAggregationViewerPanel";
import { copy } from "@/features/trade-aggregation-viewer/copy";

describe("TradeAggregationViewerPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<TradeAggregationViewerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<TradeAggregationViewerPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
