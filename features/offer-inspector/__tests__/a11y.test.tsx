import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { OfferInspectorPanel } from "@/features/offer-inspector/components/OfferInspectorPanel";
import { copy } from "@/features/offer-inspector/copy";
import { handlers } from "@/features/offer-inspector/msw/handlers";
import { accountId } from "@/features/offer-inspector/fixtures/offerInspector.fixture";

withMswHandlers(...handlers);

describe("OfferInspectorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<OfferInspectorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a rendered offers table", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<OfferInspectorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());

    await expectNoAxeViolations(container);
  });
});

