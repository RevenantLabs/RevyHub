import { describe, expect, it } from "vitest";
import { reconcileTransactionBalanceChanges } from "@/features/transaction-balance-change-reconciler/lib/transactionBalanceChangeReconciler";
import {
  accountRemoved,
  nonBalanceOnly,
  unexplainedResidual,
  unpairedRemoval
} from "@/features/transaction-balance-change-reconciler/fixtures/boundary.fixture";
import {
  feeSponsoredPayment,
  metaV3Payment,
  normalPayment,
  normalTrustline,
  notMetaXdr,
  repeatedKeyChanges,
  trustlineCreated
} from "@/features/transaction-balance-change-reconciler/fixtures/normal.fixture";

function expectOk(input: Parameters<typeof reconcileTransactionBalanceChanges>[0]) {
  const result = reconcileTransactionBalanceChanges(input);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.code);
  return result.value;
}

describe("reconcileTransactionBalanceChanges", () => {
  it("reconciles a classic native payment with zero residual", () => {
    const report = expectOk(normalPayment);

    expect(report.fullyReconciled).toBe(true);
    expect(report.fee.feeCharged).toBe("100");
    expect(report.fee.sponsored).toBe(false);
    expect(report.metaVariant).toBe("v2");

    const native = report.residuals.find((row) => row.asset.kind === "native");
    expect(native?.residual).toBe("0");
    expect(report.deltas.length).toBeGreaterThanOrEqual(2);
  });

  it("retains issuer identity on trustline deltas", () => {
    const report = expectOk(normalTrustline);
    const credit = report.deltas.filter((row) => row.asset.kind === "credit");
    expect(credit.length).toBe(2);
    expect(credit.every((row) => row.asset.kind === "credit" && row.asset.code === "USDC")).toBe(
      true
    );
    expect(
      credit.every(
        (row) => row.asset.kind === "credit" && row.asset.issuer === normalTrustline.issuer
      )
    ).toBe(true);

    const residual = report.residuals.find((row) => row.asset.kind === "credit");
    expect(residual?.reconciled).toBe(true);
  });

  it("reports fee sponsorship on a fee-bump envelope", () => {
    const report = expectOk(feeSponsoredPayment);
    expect(report.fee.sponsored).toBe(true);
    expect(report.fee.feeSource).toBe(feeSponsoredPayment.feeSource);
    expect(report.fullyReconciled).toBe(true);
  });

  it("nets repeated changes to one key", () => {
    const report = expectOk(repeatedKeyChanges);
    const nativeSource = report.deltas.find(
      (row) => row.asset.kind === "native" && row.delta === "-100000100"
    );
    expect(nativeSource).toBeDefined();
    expect(report.fullyReconciled).toBe(true);
  });

  it("handles trustline creation then funding", () => {
    const report = expectOk(trustlineCreated);
    const eur = report.deltas.find(
      (row) => row.asset.kind === "credit" && row.asset.code === "EUR"
    );
    expect(eur?.after).toBe("25000000");
  });

  it("supports metadata v3", () => {
    const report = expectOk(metaV3Payment);
    expect(report.metaVariant).toBe("v3");
    expect(report.fullyReconciled).toBe(true);
  });

  it("surfaces an unexplained residual without calling it a payment", () => {
    const report = expectOk(unexplainedResidual);
    expect(report.fullyReconciled).toBe(false);
    expect(report.evidence.incompleteReasons).toContain("unexplained_residual");
    expect(report.residuals.some((row) => !row.reconciled)).toBe(true);
  });

  it("flags unpaired removal as incomplete evidence", () => {
    const report = expectOk(unpairedRemoval);
    expect(report.evidence.incompleteReasons).toContain("unpaired_change");
    expect(report.fullyReconciled).toBe(false);
  });

  it("handles account removal with a prior state", () => {
    const report = expectOk(accountRemoved);
    const removed = report.deltas.find((row) => row.delta === "-25000000");
    expect(removed).toBeDefined();
  });

  it("skips non-balance entries and still reports the fee debit", () => {
    const report = expectOk(nonBalanceOnly);
    expect(report.evidence.skippedNonBalanceEntries).toBeGreaterThan(0);
    expect(report.evidence.incompleteReasons).toContain("skipped_non_balance");
  });

  it("rejects bytes that are not transaction metadata", () => {
    const result = reconcileTransactionBalanceChanges({
      ...normalPayment,
      metaXdr: notMetaXdr
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("malformed_data");
  });
});
