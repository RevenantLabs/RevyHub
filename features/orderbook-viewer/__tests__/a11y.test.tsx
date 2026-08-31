import { describe, it } from "vitest";
import { fireEvent, renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { OrderbookViewerPanel } from "@/features/orderbook-viewer/components/OrderbookViewerPanel";
import { copy } from "@/features/orderbook-viewer/copy";
import { handlers } from "@/features/orderbook-viewer/msw/handlers";
import { pairInput } from "@/features/orderbook-viewer/fixtures/orderbookViewer.fixture";
import { withMswHandlers } from "@/core/testing/msw";

withMswHandlers(...handlers);

describe("OrderbookViewerPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<OrderbookViewerPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no violations with an order book rendered", async () => {
    const { container } = renderFeature(<OrderbookViewerPanel />);
    fireEvent.change(screen.getByLabelText(copy.formLabel), { target: { value: pairInput } });
    await screen.getByRole("button", { name: copy.submit }).click();
    await screen.findByText(copy.bidsTitle);
    await expectNoAxeViolations(container);
  });
});
