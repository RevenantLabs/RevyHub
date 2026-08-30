import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { ClaimableBalancesPanel } from "@/features/claimable-balances/components/ClaimableBalancesPanel";
import { copy } from "@/features/claimable-balances/copy";
import { handlers } from "@/features/claimable-balances/msw/handlers";
import { claimantAccount } from "@/features/claimable-balances/fixtures/claimableBalances.fixture";

withMswHandlers(...handlers);

describe("ClaimableBalancesPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<ClaimableBalancesPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with claimable balances shown", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<ClaimableBalancesPanel />);

    await user.type(screen.getByLabelText(copy.accountLabel), claimantAccount);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText("can be claimed at any time");

    await expectNoAxeViolations(container);
  });
});
