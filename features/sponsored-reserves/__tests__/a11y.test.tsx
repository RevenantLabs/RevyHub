import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { SponsoredReservesPanel } from "@/features/sponsored-reserves/components/SponsoredReservesPanel";
import { copy } from "@/features/sponsored-reserves/copy";
import { handlers } from "@/features/sponsored-reserves/msw/handlers";
import { accountId } from "@/features/sponsored-reserves/fixtures/sponsoredReserves.fixture";

withMswHandlers(...handlers);

describe("SponsoredReservesPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<SponsoredReservesPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a rendered result", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<SponsoredReservesPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await waitFor(() => expect(screen.getByText(copy.result.sponsoredByOthers)).toBeInTheDocument());

    await expectNoAxeViolations(container);
  });
});
