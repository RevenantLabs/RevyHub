import type { AssetIdentity } from "@/features/path-payment-slippage-calculator/types";
export function formatBasisPoints(value: string): string {
  const bps = BigInt(value); const sign = bps < 0n ? "-" : ""; const absolute = bps < 0n ? -bps : bps;
  return `${sign}${absolute / 100n}.${(absolute % 100n).toString().padStart(2, "0")}%`;
}
export function formatAsset(asset: AssetIdentity): string {
  return asset.type === "native" ? "XLM" : `${asset.code}:${asset.issuer}`;
}
