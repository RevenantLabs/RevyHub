import { describe, expect, it } from "vitest";
import {
  computeBalanceDeltas,
  computeResiduals,
  isFullyReconciled
} from "@/features/transaction-balance-change-reconciler/lib/balance-deltas";
import type {
  BalanceDelta,
  EntryChangePair,
  FeeInfo
} from "@/features/transaction-balance-change-reconciler/types";
import {
  destination,
  issuer,
  source
} from "@/features/transaction-balance-change-reconciler/fixtures/normal.fixture";

function pair(partial: Partial<EntryChangePair> & { delta: string }): EntryChangePair {
  return {
    ledgerKey: partial.ledgerKey ?? "key",
    accountId: partial.accountId ?? source.publicKey(),
    asset: partial.asset ?? { kind: "native" },
    beforeBalance: partial.beforeBalance ?? "0",
    afterBalance: partial.afterBalance ?? "0",
    delta: partial.delta,
    changeKinds: partial.changeKinds ?? ["state", "updated"],
    source: partial.source ?? "operation",
    operationIndex: partial.operationIndex ?? 0,
    incomplete: partial.incomplete ?? false
  };
}

describe("computeBalanceDeltas", () => {
  it("sums repeated changes to one account/asset", () => {
    const { deltas } = computeBalanceDeltas([
      pair({
        beforeBalance: "1100000100",
        afterBalance: "1100000000",
        delta: "-100",
        source: "tx_before",
        operationIndex: null
      }),
      pair({
        beforeBalance: "1100000000",
        afterBalance: "1000000000",
        delta: "-100000000",
        source: "operation",
        operationIndex: 0
      }),
      pair({
        accountId: destination.publicKey(),
        beforeBalance: "0",
        afterBalance: "100000000",
        delta: "100000000"
      })
    ]);

    const sourceDelta = deltas.find((row) => row.accountId === source.publicKey());
    expect(sourceDelta?.delta).toBe("-100000100");
  });

  it("keeps issuer identity when aggregating credit assets", () => {
    const asset = { kind: "credit" as const, code: "USDC", issuer: issuer.publicKey() };
    const { deltas } = computeBalanceDeltas([
      pair({
        asset,
        beforeBalance: "500000000",
        afterBalance: "400000000",
        delta: "-100000000"
      }),
      pair({
        accountId: destination.publicKey(),
        asset,
        beforeBalance: "100000000",
        afterBalance: "200000000",
        delta: "100000000"
      })
    ]);

    expect(deltas).toHaveLength(2);
    expect(deltas.every((row) => row.asset.kind === "credit")).toBe(true);
  });

  it("counts incomplete pairs without inventing a delta", () => {
    const real = computeBalanceDeltas([
      {
        ledgerKey: "k",
        accountId: destination.publicKey(),
        asset: { kind: "native" },
        beforeBalance: null,
        afterBalance: "0",
        delta: null,
        changeKinds: ["removed"],
        source: "operation",
        operationIndex: 0,
        incomplete: true
      }
    ]);
    expect(real.deltas).toHaveLength(0);
    expect(real.unpairedCount).toBe(1);
  });
});

describe("computeResiduals", () => {
  it("expects native sum to equal −feeCharged", () => {
    const deltas: BalanceDelta[] = [
      {
        accountId: source.publicKey(),
        asset: { kind: "native" },
        before: "1000000100",
        after: "900000000",
        delta: "-100000100"
      },
      {
        accountId: destination.publicKey(),
        asset: { kind: "native" },
        before: "0",
        after: "100000000",
        delta: "100000000"
      }
    ];
    const fee: FeeInfo = {
      feeCharged: "100",
      feeSource: source.publicKey(),
      sponsored: false
    };

    const { residuals, reasons } = computeResiduals(deltas, fee);
    const native = residuals.find((row) => row.asset.kind === "native");
    expect(native?.summedDelta).toBe("-100");
    expect(native?.expectedSum).toBe("-100");
    expect(native?.residual).toBe("0");
    expect(native?.reconciled).toBe(true);
    expect(isFullyReconciled(residuals, reasons)).toBe(true);
  });

  it("flags an unexplained native residual", () => {
    const deltas: BalanceDelta[] = [
      {
        accountId: source.publicKey(),
        asset: { kind: "native" },
        before: "100",
        after: "0",
        delta: "-100"
      }
    ];
    const { residuals, reasons } = computeResiduals(deltas, {
      feeCharged: "1",
      feeSource: source.publicKey(),
      sponsored: false
    });

    expect(residuals[0]?.reconciled).toBe(false);
    expect(residuals[0]?.residual).toBe("-99");
    expect(reasons).toContain("unexplained_residual");
    expect(isFullyReconciled(residuals, reasons)).toBe(false);
  });

  it("expects issued-asset sums to be zero", () => {
    const asset = { kind: "credit" as const, code: "USDC", issuer: issuer.publicKey() };
    const { residuals } = computeResiduals(
      [
        {
          accountId: source.publicKey(),
          asset,
          before: "5",
          after: "4",
          delta: "-1"
        },
        {
          accountId: destination.publicKey(),
          asset,
          before: "0",
          after: "1",
          delta: "1"
        }
      ],
      { feeCharged: "100", feeSource: source.publicKey(), sponsored: false }
    );

    const credit = residuals.find((row) => row.asset.kind === "credit");
    expect(credit?.residual).toBe("0");
    expect(credit?.reconciled).toBe(true);
  });
});
