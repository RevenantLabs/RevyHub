import type {
  SponsoredEntry,
  SponsoredEntryKind
} from "@/features/sponsored-reserves/types";

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

export interface SponsoredEntrySummary {
  kind: SponsoredEntryKind;
  count: number;
}

/** Counts listed sponsored entries in the same stable order as the table. */
export function summarizeSponsoredEntries(
  entries: readonly SponsoredEntry[]
): SponsoredEntrySummary[] {
  const counts: Record<SponsoredEntryKind, number> = {
    account: 0,
    trustline: 0,
    signer: 0,
    offer: 0,
    data: 0
  };

  for (const entry of entries) counts[entry.kind] += 1;

  return (Object.keys(counts) as SponsoredEntryKind[])
    .filter((kind) => counts[kind] > 0)
    .map((kind) => ({ kind, count: counts[kind] }));
}

export function reserveEffectDirection(stroops: string): "relief" | "burden" | "neutral" {
  const value = BigInt(stroops);
  if (value > 0n) return "relief";
  if (value < 0n) return "burden";
  return "neutral";
}
