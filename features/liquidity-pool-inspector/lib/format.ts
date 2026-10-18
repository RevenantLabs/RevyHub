/** Stellar amounts use exactly 7 decimal places on the ledger. */
export const AMOUNT_SCALE = 7;

const AMOUNT_MULTIPLIER = 10n ** BigInt(AMOUNT_SCALE);

export function parseAmount(amount: string): bigint {
  const [whole = "0", fraction = ""] = amount.split(".");
  const padded = fraction.padEnd(AMOUNT_SCALE, "0").slice(0, AMOUNT_SCALE);
  return BigInt(whole) * AMOUNT_MULTIPLIER + BigInt(padded);
}

/** Formats a fixed-point bigint with `scale` fractional digits. */
export function formatFixed(value: bigint, scale = AMOUNT_SCALE): string {
  const divisor = 10n ** BigInt(scale);
  const whole = value / divisor;
  const fraction = (value % divisor).toString().padStart(scale, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : String(whole);
}

/**
 * Returns B per 1 A from two reserve amounts, both already scaled to 7 decimals.
 * The result is formatted with `priceScale` fractional digits.
 */
export function impliedPrice(amountA: bigint, amountB: bigint, priceScale = AMOUNT_SCALE): string {
  if (amountA === 0n) return "0";
  const scaled = (amountB * 10n ** BigInt(priceScale)) / amountA;
  return formatFixed(scaled, priceScale);
}

/** Reserve A backing one pool share, derived in fixed-point arithmetic. */
export function shareValue(reserveAmount: bigint, totalShares: bigint, priceScale = AMOUNT_SCALE): string {
  if (totalShares === 0n) return "0";
  const scaled = (reserveAmount * 10n ** BigInt(priceScale)) / totalShares;
  return formatFixed(scaled, priceScale);
}

export function formatAssetLabel(reserve: {
  assetType: "native" | "credit";
  assetCode?: string;
  assetIssuer?: string;
}): string {
  if (reserve.assetType === "native") return "XLM";
  if (reserve.assetCode && reserve.assetIssuer) {
    return `${reserve.assetCode}:${reserve.assetIssuer}`;
  }
  return reserve.assetCode ?? "Unknown asset";
}

export function formatFeeBasisPoints(feeBp: number): string {
  return `${feeBp} bps (${(feeBp / 100).toFixed(2)}%)`;
}

export function formatPricePair(
  assetA: string,
  assetB: string,
  priceAToB: string,
  priceBToA: string
): { aToB: string; bToA: string } {
  return {
    aToB: `1 ${assetA} ≈ ${priceAToB} ${assetB}`,
    bToA: `1 ${assetB} ≈ ${priceBToA} ${assetA}`
  };
}
