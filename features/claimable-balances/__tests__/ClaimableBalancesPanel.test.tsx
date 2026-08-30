import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { ClaimableBalancesPanel } from "@/features/claimable-balances/components/ClaimableBalancesPanel";
import { copy, errorCopy } from "@/features/claimable-balances/copy";
import { handlers } from "@/features/claimable-balances/msw/handlers";
import {
  balanceId,
  claimantAccount,
  missingBalanceId
} from "@/features/claimable-balances/fixtures/claimableBalances.fixture";

withMswHandlers(...handlers);

describe("ClaimableBalancesPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<ClaimableBalancesPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<ClaimableBalancesPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("lists claimable balances for a claimant account", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<ClaimableBalancesPanel />);

    await user.type(screen.getByLabelText(copy.accountLabel), claimantAccount);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText("can be claimed at any time")).toBeInTheDocument();
    expect(screen.getByText(copy.listCount(1))).toBeInTheDocument();
  });

  it("looks up a balance by ID", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<ClaimableBalancesPanel />);

    await user.click(screen.getByLabelText(copy.modeBalance));
    await user.type(screen.getByLabelText(copy.balanceLabel), balanceId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(/125\.5 USDC:/)).toBeInTheDocument();
    expect(screen.getByText(copy.resultTitleSingle)).toBeInTheDocument();
  });

  it("explains when a balance ID is not found", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<ClaimableBalancesPanel />);

    await user.click(screen.getByLabelText(copy.modeBalance));
    await user.type(screen.getByLabelText(copy.balanceLabel), missingBalanceId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.balance_not_found.title)).toBeInTheDocument();
  });
});
