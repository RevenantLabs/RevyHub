import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { ClaimableBalanceReadinessPanel } from "@/features/claimable-balance-readiness/components/ClaimableBalanceReadinessPanel";
import { copy, errorCopy } from "@/features/claimable-balance-readiness/copy";
import { handlers } from "@/features/claimable-balance-readiness/msw/handlers";
import {
  balanceId,
  claimantAccount,
  evaluationTime,
  missingBalanceId,
  noCreationBalanceId,
  outsiderAccount
} from "@/features/claimable-balance-readiness/fixtures/claimableBalanceReadiness.fixture";

withMswHandlers(...handlers);

async function fillAndSubmit(
  user: ReturnType<typeof renderFeature>["user"],
  values: { balanceId: string; claimant: string; evaluationTime?: string }
) {
  const timeInput = screen.getByLabelText(copy.timeLabel);
  await user.clear(timeInput);
  await user.type(timeInput, values.evaluationTime ?? evaluationTime);
  await user.type(screen.getByLabelText(copy.balanceLabel), values.balanceId);
  await user.type(screen.getByLabelText(copy.claimantLabel), values.claimant);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("ClaimableBalanceReadinessPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<ClaimableBalanceReadinessPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error for an invalid balance ID", async () => {
    const { user } = renderFeature(<ClaimableBalanceReadinessPanel />);
    await fillAndSubmit(user, { balanceId: "bad", claimant: claimantAccount });
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(errorCopy.invalid_balance_id.title)).toBeInTheDocument();
  });

  it("shows eligible readiness for an unconditional claimant", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<ClaimableBalanceReadinessPanel />);
    await fillAndSubmit(user, { balanceId, claimant: claimantAccount });

    expect(await screen.findByText(copy.verdictEligibleDescription)).toBeInTheDocument();
    expect(screen.getByText(/125\.5 USDC:/)).toBeInTheDocument();
    expect(screen.getAllByText("can be claimed at any time").length).toBeGreaterThan(0);
  });

  it("explains when the selected address is not a claimant", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<ClaimableBalanceReadinessPanel />);
    await fillAndSubmit(user, { balanceId, claimant: outsiderAccount });

    expect(await screen.findByText(copy.verdictNotListedDescription)).toBeInTheDocument();
  });

  it("shows indeterminate when creation context is missing", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<ClaimableBalanceReadinessPanel />);
    await fillAndSubmit(user, {
      balanceId: noCreationBalanceId,
      claimant: claimantAccount
    });

    expect(await screen.findByText(copy.verdictIndeterminateDescription)).toBeInTheDocument();
    expect(screen.getByText(copy.creationUnavailable)).toBeInTheDocument();
  });

  it("explains when a balance ID is not found", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<ClaimableBalanceReadinessPanel />);
    await fillAndSubmit(user, {
      balanceId: missingBalanceId,
      claimant: claimantAccount
    });

    expect(await screen.findByText(errorCopy.balance_not_found.title)).toBeInTheDocument();
  });
});
