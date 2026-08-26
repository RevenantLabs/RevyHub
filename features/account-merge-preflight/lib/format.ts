const STELLAR_AMOUNT = /^(0|[1-9]\d*)(?:\.(\d{1,7}))?$/;
const STROOPS_PER_XLM = 10_000_000n;

export function amountToStroops(amount: string): bigint | null {
  const match = STELLAR_AMOUNT.exec(amount);
  if (!match) return null;

  try {
    return BigInt(match[1]) * STROOPS_PER_XLM + BigInt((match[2] ?? "").padEnd(7, "0"));
  } catch {
    return null;
  }
}

export function stroopsToAmount(stroops: bigint): string {
  const whole = stroops / STROOPS_PER_XLM;
  const fraction = (stroops % STROOPS_PER_XLM).toString().padStart(7, "0");
  return `${whole}.${fraction}`;
}

export function formatAsset(asset: { asset_type: string; asset_code?: string; asset_issuer?: string }): string {
  if (asset.asset_type === "native") return "XLM";
  if (asset.asset_code && asset.asset_issuer) return `${asset.asset_code}:${asset.asset_issuer}`;
  return asset.asset_type.replace(/_/g, " ");
}
