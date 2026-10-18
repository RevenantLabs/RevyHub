import { copy } from "@/features/muxed-payment-routing-audit/copy";
/** All arithmetic stays in stroops. Display strips only insignificant trailing zeroes. */
export function amountToStroops(amount: string): bigint | null {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,7})?$/.test(amount)) return null;
  const [whole, fraction = ""] = amount.split(".");
  return BigInt(whole) * 10_000_000n + BigInt(fraction.padEnd(7, "0"));
}
export function formatStroops(stroops: bigint): string {
  const whole = stroops / 10_000_000n;
  const fraction = (stroops % 10_000_000n).toString().padStart(7, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}
export function formatAsset(code: string, issuer: string | null): string {
  return issuer ? `${code} · ${copy.assetIssuer}: ${issuer}` : copy.nativeAsset;
}
export function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? copy.unknownDate : date.toISOString().replace("T", " ").replace(".000Z", copy.utcSuffix);
}
