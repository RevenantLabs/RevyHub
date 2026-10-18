import type { PaymentAsset } from "@/features/payment-qr/types";

export function formatAsset(asset: PaymentAsset): string {
  return asset.kind === "native" ? "XLM (native)" : `${asset.code}:${asset.issuer}`;
}

/** Normalises an amount for display without touching its precision. */
export function formatAmount(amount: string): string {
  const [whole, fraction] = amount.split(".");
  if (!fraction) return whole;
  const trimmed = fraction.replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}
