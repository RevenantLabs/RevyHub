import { describe, it } from "vitest";
import { fireEvent, renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { TradeHistoryPanel } from "@/features/trade-history/components/TradeHistoryPanel";
import { copy } from "@/features/trade-history/copy";
import { pairInput } from "@/features/trade-history/fixtures/tradeHistory.fixture";
import { handlers } from "@/features/trade-history/msw/handlers";
import { withMswHandlers } from "@/core/testing/msw";

withMswHandlers(...handlers);

describe("TradeHistoryPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<TradeHistoryPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no violations with a trade result rendered", async () => {
    const { container } = renderFeature(<TradeHistoryPanel />);
    fireEvent.change(screen.getByLabelText(copy.formLabel), { target: { value: pairInput } });
    fireEvent.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.resultTitle);
    await expectNoAxeViolations(container);
  });
});
