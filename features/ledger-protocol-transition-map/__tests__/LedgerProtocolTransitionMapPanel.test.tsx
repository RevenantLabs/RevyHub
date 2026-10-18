import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { LedgerProtocolTransitionMapPanel } from "@/features/ledger-protocol-transition-map/components/LedgerProtocolTransitionMapPanel";
import { copy, errorCopy } from "@/features/ledger-protocol-transition-map/copy";
import { handlers, rateLimitedHandler } from "@/features/ledger-protocol-transition-map/msw/handlers";

const server = withMswHandlers(...handlers);

describe("LedgerProtocolTransitionMapPanel", () => {
  it("shows the empty state", () => {
    renderFeature(<LedgerProtocolTransitionMapPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("renders runs and transitions after a successful scan", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<LedgerProtocolTransitionMapPanel />, { network: "testnet" });

    await user.clear(screen.getByLabelText(copy.startLabel));
    await user.type(screen.getByLabelText(copy.startLabel), "1000");
    await user.clear(screen.getByLabelText(copy.countLabel));
    await user.type(screen.getByLabelText(copy.countLabel), "4");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.runsTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.transitionsTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.exactBadge)).toBeInTheDocument();
  });

  it("explains invalid count", async () => {
    const { user } = renderFeature(<LedgerProtocolTransitionMapPanel />, { network: "testnet" });

    await user.clear(screen.getByLabelText(copy.countLabel));
    await user.type(screen.getByLabelText(copy.countLabel), "1");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_count.title)).toBeInTheDocument();
  });

  it("explains rate limiting", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    const { user } = renderFeature(<LedgerProtocolTransitionMapPanel />, { network: "testnet" });

    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.rate_limited.title)).toBeInTheDocument();
  });
});
