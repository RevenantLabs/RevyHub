import type { GapKind } from "@/features/transaction-sequence-gap-auditor/types";
import { copy } from "@/features/transaction-sequence-gap-auditor/copy";

export function formatSequence(sequence: string | bigint): string {
  return typeof sequence === "bigint" ? sequence.toString() : sequence;
}

export function formatGapKind(kind: GapKind): string {
  return copy.gapKind[kind];
}

export function formatMissingCount(count: string | bigint): string {
  const value = typeof count === "bigint" ? count : BigInt(count);
  return value === 1n ? copy.oneSequence : `${value.toString()} ${copy.sequences}`;
}

export function shortenHash(hash: string): string {
  return hash.length <= 9 ? hash : `${hash.slice(0, 4)}…${hash.slice(-4)}`;
}

export function formatNetwork(network: "testnet" | "mainnet"): string {
  return network === "testnet" ? copy.testnet : copy.mainnet;
}
