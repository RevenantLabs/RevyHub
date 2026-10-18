import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { OfferLiabilityHeadroomPanel } from "@/features/offer-liability-headroom/components/OfferLiabilityHeadroomPanel";
import { copy, errorCopy } from "@/features/offer-liability-headroom/copy";
import { handlers, rateLimitedHandler } from "@/features/offer-liability-headroom/msw/handlers";
import { accountId } from "@/features/offer-liability-headroom/fixtures/offerLiabilityHeadroom.fixture";

const server = withMswHandlers(...handlers);

describe("OfferLiabilityHeadroomPanel", () => {
  it("shows empty state", () => {
    renderFeature(<OfferLiabilityHeadroomPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("renders offers and liabilities", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<OfferLiabilityHeadroomPanel />, { network: "testnet" });
    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(copy.offersTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.liabilitiesTitle)).toBeInTheDocument();
  });

  it("explains invalid accounts", async () => {
    const { user } = renderFeature(<OfferLiabilityHeadroomPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), "nope");
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.invalid_account.title)).toBeInTheDocument();
  });

  it("explains rate limiting", async () => {
    server.use(rateLimitedHandler);
    resetHorizonClients();
    const { user } = renderFeature(<OfferLiabilityHeadroomPanel />, { network: "testnet" });
    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.rate_limited.title)).toBeInTheDocument();
  });
});
