import { describe, expect, it } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { Sep38QuoteViewerPanel } from "@/features/sep38-quote-viewer/components/Sep38QuoteViewerPanel";
import { copy } from "@/features/sep38-quote-viewer/copy";
import {
  OFF_CHAIN_ASSET,
  ON_CHAIN_ASSET,
  SELL_AMOUNT
} from "@/features/sep38-quote-viewer/fixtures/sep38QuoteViewer.fixture";
import { handlers } from "@/features/sep38-quote-viewer/msw/handlers";

withMswHandlers(...handlers);

describe("Sep38QuoteViewerPanel accessibility", () => {
  it("has no WCAG A/AA violations in the idle state", async () => {
    const { container } = renderFeature(<Sep38QuoteViewerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations when an indicative price is shown", async () => {
    const { container, user } = renderFeature(<Sep38QuoteViewerPanel />);
    fireEvent.change(screen.getByLabelText(copy.homeDomainLabel), { target: { value: "quote.example" } });
    fireEvent.change(screen.getByLabelText(copy.offChainLabel), { target: { value: OFF_CHAIN_ASSET } });
    fireEvent.change(screen.getByLabelText(copy.onChainLabel), { target: { value: ON_CHAIN_ASSET } });
    fireEvent.change(screen.getByLabelText(copy.amountLabel), { target: { value: SELL_AMOUNT } });
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
