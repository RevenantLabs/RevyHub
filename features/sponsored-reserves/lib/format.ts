import type { SponsoredEntry } from "@/features/sponsored-reserves/types";

const STROOPS_PER_XLM = 10_000_000n;

/** Formats stroops exactly, without converting through Number. */
export function formatStroops(stroops: string, showPositiveSign = false): string {
  const amount = BigInt(stroops);
  const negative = amount < 0n;
  const absolute = negative ? -amount : amount;
  const whole = absolute / STROOPS_PER_XLM;
  const fraction = (absolute % STROOPS_PER_XLM)
    .toString()
    .padStart(7, "0")
    .replace(/0+$/, "");
  const sign = negative ? "-" : showPositiveSign && amount > 0n ? "+" : "";

  return `${sign}${whole}${fraction ? `.${fraction}` : ""}`;
}

export function formatEntryReference(entry: SponsoredEntry): string {
  return entry.kind === "offer" ? `#${entry.reference}` : entry.reference;
}

export function reserveEffectDirection(stroops: string): "relief" | "burden" | "neutral" {
  const value = BigInt(stroops);
  if (value > 0n) return "relief";
  if (value < 0n) return "burden";
  return "neutral";
}
