import type {
  AccountThresholds,
  SignerEntry,
  ThresholdLevel,
  ThresholdReachability
} from "@/features/signer-rotation-impact-auditor/types";

const LEVELS: readonly ThresholdLevel[] = ["low", "medium", "high"];

/** Keeps integer weight strings lossless — never coerce through `Number`. */
export function formatWeight(weight: string | null | undefined): string {
  if (weight === null || weight === undefined) return "—";
  return weight;
}

export function formatThresholds(thresholds: AccountThresholds): string {
  return `${formatWeight(thresholds.low)} / ${formatWeight(thresholds.medium)} / ${formatWeight(thresholds.high)}`;
}

/** Shortens a Stellar address for dense timeline rows without losing identity. */
export function shortenKey(key: string, head = 4, tail = 4): string {
  if (key.length <= head + tail + 1) return key;
  return `${key.slice(0, head)}…${key.slice(-tail)}`;
}

export function formatReachability(entry: ThresholdReachability): string {
  if (entry.reachable === null) return "unavailable";
  return entry.reachable ? "reachable" : "unreachable";
}

export function formatBoolean(value: boolean): string {
  return value ? "yes" : "no";
}

export function sortSigners(signers: SignerEntry[]): SignerEntry[] {
  return [...signers].sort((left, right) => {
    if (left.isMaster !== right.isMaster) return left.isMaster ? -1 : 1;
    return left.key.localeCompare(right.key);
  });
}

export function reachabilityByLevel(
  entries: ThresholdReachability[]
): Record<ThresholdLevel, ThresholdReachability | undefined> {
  return {
    low: entries.find((entry) => entry.level === "low"),
    medium: entries.find((entry) => entry.level === "medium"),
    high: entries.find((entry) => entry.level === "high")
  };
}

export function levelsInOrder(): readonly ThresholdLevel[] {
  return LEVELS;
}

/** Absent values render as an em dash, never as an empty cell or "0". */
export function formatOptional(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}
