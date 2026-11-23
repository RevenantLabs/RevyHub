import type {
  AssetRef,
  BalanceDelta,
  IncompleteEvidenceReason
} from "@/features/transaction-balance-change-reconciler/types";

/**
 * Formats an integer stroop count as a 7-decimal Stellar amount string without
 * going through `Number`.
 */
export function formatStroops(stroops: string): string {
  let value: bigint;
  try {
    value = BigInt(stroops);
  } catch {
    return stroops;
  }

  const negative = value < 0n;
  const magnitude = negative ? -value : value;
  const whole = magnitude / 10_000_000n;
  const fraction = (magnitude % 10_000_000n).toString().padStart(7, "0");
  const trimmed = fraction.replace(/0+$/, "");
  const body = trimmed ? `${whole}.${trimmed}` : String(whole);
  return negative ? `-${body}` : body;
}

/** Lossless identity string for an asset — issuer retained for credit assets. */
export function formatAssetRef(asset: AssetRef): string {
  if (asset.kind === "native") return "XLM (native)";
  return `${asset.code}:${asset.issuer}`;
}

/** Stable map key so residuals and deltas group by the same identity. */
export function assetKey(asset: AssetRef): string {
  if (asset.kind === "native") return "native";
  return `credit:${asset.code}:${asset.issuer}`;
}

/** Signed stroop delta with an explicit "+" for credits. */
export function formatSignedStroops(stroops: string): string {
  const formatted = formatStroops(stroops);
  if (formatted.startsWith("-") || formatted === "0") return formatted;
  return `+${formatted}`;
}

export function formatAccountId(accountId: string, visible = 4): string {
  if (accountId.length <= visible * 2 + 1) return accountId;
  return `${accountId.slice(0, visible)}…${accountId.slice(-visible)}`;
}

export function sortDeltas(deltas: readonly BalanceDelta[]): BalanceDelta[] {
  return [...deltas].sort((a, b) => {
    const account = a.accountId.localeCompare(b.accountId);
    if (account !== 0) return account;
    return assetKey(a.asset).localeCompare(assetKey(b.asset));
  });
}

export function incompleteReasonLabel(
  reason: IncompleteEvidenceReason,
  labels: Record<IncompleteEvidenceReason, string>
): string {
  return labels[reason];
}
