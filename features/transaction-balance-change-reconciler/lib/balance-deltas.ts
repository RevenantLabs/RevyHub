import { assetKey } from "@/features/transaction-balance-change-reconciler/lib/format";
import type {
  AssetRef,
  AssetResidual,
  BalanceDelta,
  EntryChangePair,
  FeeInfo,
  IncompleteEvidenceReason
} from "@/features/transaction-balance-change-reconciler/types";

interface Aggregate {
  accountId: string;
  asset: AssetRef;
  before: bigint | null;
  after: bigint | null;
  delta: bigint;
}

/**
 * Collapses paired ledger changes into one net delta per account per asset.
 *
 * Multiple touches to the same key (for example a fee debit in txChangesBefore
 * plus a payment debit in an operation) sum their deltas. Incomplete pairs that
 * never produced a delta are counted so the UI can surface unpaired evidence.
 */
export function computeBalanceDeltas(pairs: readonly EntryChangePair[]): {
  deltas: BalanceDelta[];
  unpairedCount: number;
} {
  const map = new Map<string, Aggregate>();
  let unpairedCount = 0;

  for (const pair of pairs) {
    if (!pair.accountId || !pair.asset) {
      if (pair.incomplete) unpairedCount += 1;
      continue;
    }

    if (pair.delta === null) {
      if (pair.incomplete) unpairedCount += 1;
      continue;
    }

    const key = `${pair.accountId}|${assetKey(pair.asset)}`;
    const existing = map.get(key);
    const delta = BigInt(pair.delta);

    if (!existing) {
      map.set(key, {
        accountId: pair.accountId,
        asset: pair.asset,
        before: pair.beforeBalance !== null ? BigInt(pair.beforeBalance) : null,
        after: pair.afterBalance !== null ? BigInt(pair.afterBalance) : null,
        delta
      });
      continue;
    }

    existing.delta += delta;
    if (existing.before === null && pair.beforeBalance !== null) {
      existing.before = BigInt(pair.beforeBalance);
    }
    if (pair.afterBalance !== null) {
      existing.after = BigInt(pair.afterBalance);
    }
  }

  const deltas: BalanceDelta[] = [...map.values()].map((row) => {
    const before = row.before ?? (row.after !== null ? row.after - row.delta : 0n);
    const after = row.after ?? before + row.delta;
    return {
      accountId: row.accountId,
      asset: row.asset,
      before: before.toString(),
      after: after.toString(),
      delta: row.delta.toString()
    };
  });

  return { deltas, unpairedCount };
}

/**
 * Per-asset residual: sum of account deltas versus the conservation expectation.
 *
 * Native balances are expected to sum to −feeCharged (the fee leaves the
 * circulating supply). Issued assets are expected to sum to 0. A non-zero
 * residual is unexplained — never labelled as a payment.
 */
export function computeResiduals(
  deltas: readonly BalanceDelta[],
  fee: FeeInfo
): { residuals: AssetResidual[]; reasons: IncompleteEvidenceReason[] } {
  const sums = new Map<string, { asset: AssetRef; sum: bigint }>();

  for (const delta of deltas) {
    const key = assetKey(delta.asset);
    const existing = sums.get(key);
    const amount = BigInt(delta.delta);
    if (existing) existing.sum += amount;
    else sums.set(key, { asset: delta.asset, sum: amount });
  }

  // Native always appears when a fee was charged, even if no account delta
  // was observed — that itself is incomplete evidence.
  if (fee.feeCharged !== null && !sums.has("native")) {
    sums.set("native", { asset: { kind: "native" }, sum: 0n });
  }

  const reasons: IncompleteEvidenceReason[] = [];
  const residuals: AssetResidual[] = [];

  for (const { asset, sum } of sums.values()) {
    let expectedSum: string | null;
    if (asset.kind === "native") {
      if (fee.feeCharged === null) {
        expectedSum = null;
        reasons.push("missing_fee_evidence");
      } else {
        expectedSum = (-BigInt(fee.feeCharged)).toString();
      }
    } else {
      expectedSum = "0";
    }

    let residual: string | null = null;
    let reconciled = false;

    if (expectedSum !== null) {
      residual = (sum - BigInt(expectedSum)).toString();
      reconciled = residual === "0";
      if (!reconciled) reasons.push("unexplained_residual");
    }

    residuals.push({
      asset,
      summedDelta: sum.toString(),
      expectedSum,
      residual,
      reconciled
    });
  }

  residuals.sort((a, b) => assetKey(a.asset).localeCompare(assetKey(b.asset)));
  return { residuals, reasons: [...new Set(reasons)] };
}

export function isFullyReconciled(
  residuals: readonly AssetResidual[],
  reasons: readonly IncompleteEvidenceReason[]
): boolean {
  if (reasons.length > 0) return false;
  return residuals.length === 0 || residuals.every((row) => row.reconciled);
}
