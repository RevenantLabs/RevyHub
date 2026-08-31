import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { OrderbookViewerPanel } from "@/features/orderbook-viewer/components/OrderbookViewerPanel";
import { copy } from "@/features/orderbook-viewer/copy";

describe("OrderbookViewerPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<OrderbookViewerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<OrderbookViewerPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
