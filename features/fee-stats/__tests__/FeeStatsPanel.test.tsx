import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { FeeStatsPanel } from "@/features/fee-stats/components/FeeStatsPanel";
import { copy, congestionCopy, errorCopy } from "@/features/fee-stats/copy";
import { handlers, rateLimitedHandler } from "@/features/fee-stats/msw/handlers";

const server = withMswHandlers(...handlers);

describe("FeeStatsPanel", () => {
  it("shows the empty state before anything is loaded", () => {
    renderFeature(<FeeStatsPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("reports a calm ledger with both distributions", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<FeeStatsPanel />, { network: "testnet" });

    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(congestionCopy.calm.title)).toBeInTheDocument();
    expect(screen.getByText(copy.chargedTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.maxFeeTitle)).toBeInTheDocument();
    expect(screen.getAllByRole("table")).toHaveLength(2);
  });

  it("warns and recommends a higher fee on a congested ledger", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<FeeStatsPanel />, { network: "mainnet" });

    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(congestionCopy.congested.title)).toBeInTheDocument();
    // The recommendation states its basis, and P99 is the congested band's pick.
    expect(screen.getByText(/P99 of recently charged fees/)).toBeInTheDocument();
    expect(screen.getAllByText("35000").length).toBeGreaterThan(0);
  });

  it("offers a refresh once a reading exists", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<FeeStatsPanel />, { network: "testnet" });

    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(congestionCopy.calm.title);

    expect(screen.getByRole("button", { name: copy.refresh })).toBeInTheDocument();
  });

  it("explains rate limiting instead of failing silently", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    const { user } = renderFeature(<FeeStatsPanel />, { network: "testnet" });

    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.rate_limited.title)).toBeInTheDocument();
  });
});
