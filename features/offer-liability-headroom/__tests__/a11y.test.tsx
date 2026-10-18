import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { OfferLiabilityHeadroomPanel } from "@/features/offer-liability-headroom/components/OfferLiabilityHeadroomPanel";
import { copy } from "@/features/offer-liability-headroom/copy";
import { handlers } from "@/features/offer-liability-headroom/msw/handlers";
import { accountId } from "@/features/offer-liability-headroom/fixtures/offerLiabilityHeadroom.fixture";

withMswHandlers(...handlers);

describe("OfferLiabilityHeadroomPanel accessibility", () => {
  it("has no WCAG A/AA violations idle", async () => {
    const { container } = renderFeature(<OfferLiabilityHeadroomPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations after success", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<OfferLiabilityHeadroomPanel />, {
      network: "testnet"
    });
    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.offersTitle);
    await expectNoAxeViolations(container);
  });
});
