import { describe, it } from "vitest";
import { fireEvent, renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { TradeAggregationViewerPanel } from "@/features/trade-aggregation-viewer/components/TradeAggregationViewerPanel";
import { copy } from "@/features/trade-aggregation-viewer/copy";
import { pairInput } from "@/features/trade-aggregation-viewer/fixtures/tradeAggregationViewer.fixture";
import { handlers } from "@/features/trade-aggregation-viewer/msw/handlers";
import { withMswHandlers } from "@/core/testing/msw";

withMswHandlers(...handlers);

describe("TradeAggregationViewerPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<TradeAggregationViewerPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no violations with an aggregation result rendered", async () => {
    const { container } = renderFeature(<TradeAggregationViewerPanel />);
    fireEvent.change(screen.getByLabelText(copy.formLabel), { target: { value: pairInput } });
    fireEvent.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.resultTitle);
    await expectNoAxeViolations(container);
  });
});
