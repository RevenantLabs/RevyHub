import { NETWORK_LABELS } from "@/core/network/config";
import type { StellarNetwork } from "@/core/network/types";
import type { EnvelopeKind } from "@/features/transaction-fee-charge-audit/types";

/** Fees are reported in stroops; 10,000,000 stroops make one XLM. */
export function stroopsToXlm(stroops: string): string {
  const value = BigInt(stroops);
  const whole = value / 10_000_000n;
  const fraction = (value % 10_000_000n).toString().padStart(7, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : String(whole);
}

export function formatStroops(stroops: string): string {
  return `${stroops} stroops (${stroopsToXlm(stroops)} XLM)`;
}

export function formatEnvelopeKind(kind: EnvelopeKind): string {
  return kind === "fee_bump" ? "Fee-bump" : "Classic";
}

export function formatNetwork(network: StellarNetwork): string {
  return NETWORK_LABELS[network];
}

export function formatLedgerSequence(sequence: number): string {
  return String(sequence);
}

export function formatTimestamp(iso: string | null): string {
  if (!iso) return "Not reported";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toISOString().replace("T", " ").replace(".000Z", " UTC");
}

export function formatBaseFee(stroops: string | null): string {
  return stroops ? formatStroops(stroops) : "Not reported";
}

export function formatOperationCount(count: number): string {
  return String(count);
}
