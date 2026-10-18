import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { LedgerCloseCadencePanel } from "@/features/ledger-close-cadence/components/LedgerCloseCadencePanel";
import { copy, errorCopy } from "@/features/ledger-close-cadence/copy";
import { handlers, rateLimitedHandler } from "@/features/ledger-close-cadence/msw/handlers";

const server = withMswHandlers(...handlers);

describe("LedgerCloseCadencePanel", () => {
  it("shows the empty state before anything is loaded", () => {
    renderFeature(<LedgerCloseCadencePanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("renders cadence summary and intervals after a successful load", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<LedgerCloseCadencePanel />, { network: "testnet" });

    await user.clear(screen.getByLabelText(copy.formLabel));
    await user.type(screen.getByLabelText(copy.formLabel), "4");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.summaryTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.intervalsTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.medianLabel)).toBeInTheDocument();
  });

  it("explains invalid sample size", async () => {
    const { user } = renderFeature(<LedgerCloseCadencePanel />, { network: "testnet" });

    await user.clear(screen.getByLabelText(copy.formLabel));
    await user.type(screen.getByLabelText(copy.formLabel), "1");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_sample_size.title)).toBeInTheDocument();
  });

  it("explains rate limiting", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    const { user } = renderFeature(<LedgerCloseCadencePanel />, { network: "testnet" });

    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.rate_limited.title)).toBeInTheDocument();
  });
});
