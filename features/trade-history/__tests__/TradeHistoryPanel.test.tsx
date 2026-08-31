import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { TradeHistoryPanel } from "@/features/trade-history/components/TradeHistoryPanel";
import { copy } from "@/features/trade-history/copy";

describe("TradeHistoryPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<TradeHistoryPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<TradeHistoryPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
