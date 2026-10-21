import { NETWORK_LABELS } from "@/core/network/config";
import type { StellarNetwork } from "@/core/network/types";
import type { OffChainAsset, OnChainAsset } from "@/features/sep38-quote-viewer/types";

/** Group the integer part and keep the fractional digits exactly as given. */
export function formatDecimalString(value: string): string {
  const trimmed = value.trim();
  const match = /^(0|[1-9]\d*)(?:\.(\d+))?$/.exec(trimmed);
  if (!match) return trimmed;
  const whole = match[1].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return match[2] === undefined ? whole : `${whole}.${match[2]}`;
}

export function formatIndicativePrice(price: string): string {
  return formatDecimalString(price);
}

/** Render an RFC3339 timestamp in UTC so the clock does not depend on the browser zone. */
export function formatExpiration(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  const second = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}:${second} UTC`;
}

export function formatAssetIdentity(asset: OffChainAsset | OnChainAsset): string {
  if (asset.kind === "on-chain" && asset.native) return `XLM (${asset.canonical})`;
  return `${asset.code} (${asset.canonical})`;
}

export function formatNetwork(network: StellarNetwork): string {
  return NETWORK_LABELS[network];
}

export function formatFee(total: string, asset: string): string {
  return `${formatDecimalString(total)} ${asset}`;
}
