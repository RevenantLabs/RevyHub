import { truncateMiddle } from "@/core/lib/strings";
import {
  copy,
  effectTypeLabels,
  networkLabels,
  operationTypeLabels
} from "@/features/payment-receipt-reconciler/copy";
import type {
  PublicReceipt,
  ReceiptAsset
} from "@/features/payment-receipt-reconciler/types";

const AMOUNT = /^-?\d+(\.\d{1,7})?$/;
const STROOPS_PER_UNIT = 10_000_000n;

/**
 * Converts a Stellar amount to stroops without ever touching a float.
 */
export function toStroops(amount: string): bigint {
  const negative = amount.startsWith("-");
  const [whole, fraction = ""] = (negative ? amount.slice(1) : amount).split(".");
  const value =
    BigInt(whole || "0") * STROOPS_PER_UNIT + BigInt(`${fraction}0000000`.slice(0, 7));
  return negative ? -value : value;
}

/**
 * Renders an amount with thousands separators and no trailing zeros.
 * Non-Stellar strings pass through untouched.
 */
export function formatAmount(value: string): string {
  if (!AMOUNT.test(value)) return value;

  const stroops = toStroops(value);
  const magnitude = stroops < 0n ? -stroops : stroops;
  const whole = (magnitude / STROOPS_PER_UNIT)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fraction = (magnitude % STROOPS_PER_UNIT)
    .toString()
    .padStart(7, "0")
    .replace(/0+$/, "");
  const sign = stroops < 0n ? "-" : "";

  return fraction ? `${sign}${whole}.${fraction}` : `${sign}${whole}`;
}

/** Canonical asset key for grouping — native or CODE:ISSUER. */
export function assetKey(asset: ReceiptAsset): string {
  return asset.type === "native" ? "native" : `${asset.code}:${asset.issuer}`;
}

/** Display label with full issuer visibility for credit assets. */
export function formatAsset(asset: ReceiptAsset): string {
  if (asset.type === "native") return copy.nativeAsset;
  return `${asset.code}:${asset.issuer}`;
}

/** Compact label for dense lists — issuer is middle-truncated. */
export function formatAssetCompact(asset: ReceiptAsset): string {
  if (asset.type === "native") return copy.nativeAsset;
  return `${asset.code} · ${truncateMiddle(asset.issuer, 4)}`;
}

export function formatAmountWithAsset(amount: string, asset: ReceiptAsset): string {
  return `${formatAmount(amount)} ${formatAssetCompact(asset)}`;
}

/** Fees are reported in stroops. */
export function stroopsToXlm(stroops: string): string {
  const value = BigInt(stroops);
  const whole = value / STROOPS_PER_UNIT;
  const fraction = (value % STROOPS_PER_UNIT).toString().padStart(7, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : String(whole);
}

export function formatFee(stroops: string): string {
  return `${stroops} stroops (${stroopsToXlm(stroops)} XLM)`;
}

export function formatOperationType(type: string): string {
  return operationTypeLabels[type] ?? type.replace(/_/g, " ");
}

export function formatEffectType(type: string): string {
  return effectTypeLabels[type] ?? type.replace(/_/g, " ");
}

export function formatNetwork(network: string): string {
  return networkLabels[network] ?? network;
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.toISOString().slice(0, 19).replace("T", " ")} UTC`;
}

/** Plain-text public receipt for clipboard copy. */
export function formatPublicReceipt(receipt: PublicReceipt): string {
  return [
    `${copy.hashLabel}: ${receipt.hash}`,
    `${copy.networkLabel}: ${formatNetwork(receipt.network)}`,
    `${copy.ledgerLabel}: ${receipt.ledger}`
  ].join("\n");
}
