import type { OfferAssetInfo } from "@/features/offer-inspector/types";

/** Formats a decimal amount string with comma grouping and trimmed trailing zeros. */
export function formatAmount(value: string): string {
  const [whole = "0", fraction = ""] = value.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmed = fraction.replace(/0+$/, "");
  return trimmed ? `${grouped}.${trimmed}` : grouped;
}

/** Formats exact fractional price representation. */
export function formatPriceRatio(n: number, d: number): string {
  return `${n} / ${d}`;
}

/** Formats both decimal price and exact fractional representation. */
export function formatPrice(price: string, priceFraction: { n: number; d: number }): string {
  return `${formatAmount(price)} (${priceFraction.n} / ${priceFraction.d})`;
}

/** Converts stroops to XLM using BigInt arithmetic without floating point math. */
export function stroopsToXlm(stroops: bigint): string {
  const isNegative = stroops < 0n;
  const abs = isNegative ? -stroops : stroops;
  const whole = abs / 10_000_000n;
  const fraction = (abs % 10_000_000n).toString().padStart(7, "0");
  const trimmed = fraction.replace(/0+$/, "");
  const formatted = trimmed ? `${whole}.${trimmed}` : `${whole}`;
  return isNegative ? `-${formatted}` : formatted;
}

/** Formats human-readable asset description. */
export function formatAsset(asset: OfferAssetInfo): string {
  return asset.isNative ? "XLM (native)" : asset.code;
}

/** Truncates an account address for compact presentation. */
export function formatShortAddress(address?: string): string {
  if (!address) {
    return "-";
  }
  if (address.length <= 12) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

