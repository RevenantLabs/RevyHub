import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { ClaimableBalanceReadinessPanel } from "@/features/claimable-balance-readiness/components/ClaimableBalanceReadinessPanel";
import { copy } from "@/features/claimable-balance-readiness/copy";
import { handlers } from "@/features/claimable-balance-readiness/msw/handlers";
import {
  balanceId,
  claimantAccount,
  evaluationTime
} from "@/features/claimable-balance-readiness/fixtures/claimableBalanceReadiness.fixture";

withMswHandlers(...handlers);

describe("ClaimableBalanceReadinessPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<ClaimableBalanceReadinessPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a readiness result shown", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<ClaimableBalanceReadinessPanel />);

    const timeInput = screen.getByLabelText(copy.timeLabel);
    await user.clear(timeInput);
    await user.type(timeInput, evaluationTime);
    await user.type(screen.getByLabelText(copy.balanceLabel), balanceId);
    await user.type(screen.getByLabelText(copy.claimantLabel), claimantAccount);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.verdictEligibleDescription);

    await expectNoAxeViolations(container);
  });
});
