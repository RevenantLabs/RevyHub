import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { TransactionFeeChargeAuditPanel } from "@/features/transaction-fee-charge-audit/components/TransactionFeeChargeAuditPanel";
import { copy, errorCopy } from "@/features/transaction-fee-charge-audit/copy";
import { handlers } from "@/features/transaction-fee-charge-audit/msw/handlers";
import {
  classicHash,
  feeBumpHash,
  malformedFeeHash,
  missingHash
} from "@/features/transaction-fee-charge-audit/fixtures/transactionFeeChargeAudit.fixture";

withMswHandlers(...handlers);

describe("TransactionFeeChargeAuditPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<TransactionFeeChargeAuditPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("renders offered, charged and difference for a classic transaction", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<TransactionFeeChargeAuditPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), classicHash);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.feeBreakdownTitle)).toBeInTheDocument();
    expect(screen.getByText("10000 stroops (0.001 XLM)")).toBeInTheDocument();
    expect(screen.getByText("200 stroops (0.00002 XLM)")).toBeInTheDocument();
    expect(screen.getByText("9800 stroops (0.00098 XLM)")).toBeInTheDocument();
    expect(screen.getByText("Classic")).toBeInTheDocument();
    expect(screen.getByText(copy.historicalNote)).toBeInTheDocument();
  });

  it("shows fee-bump outer fee source separately from the inner fee bid", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<TransactionFeeChargeAuditPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), feeBumpHash);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText("Fee-bump")).toBeInTheDocument();
    expect(screen.getByText(copy.labelOuterFeeSource)).toBeInTheDocument();
    expect(screen.getByText(copy.labelInnerFee)).toBeInTheDocument();
    expect(screen.getByText(copy.envelopeFeeBumpDescription)).toBeInTheDocument();
  });

  it("explains that a hash is not an account address", async () => {
    const { user } = renderFeature(<TransactionFeeChargeAuditPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), "GABC");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_hash.title)).toBeInTheDocument();
  });

  it("points at the network switch when a hash is not found", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<TransactionFeeChargeAuditPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), missingHash);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.transaction_not_found.title)).toBeInTheDocument();
  });

  it("surfaces an incomplete audit for malformed fee fields", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<TransactionFeeChargeAuditPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), malformedFeeHash);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_fee_data.title)).toBeInTheDocument();
  });
});
