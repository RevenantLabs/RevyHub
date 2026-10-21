import { copy } from "@/features/memo-required-checker/copy";
import type { MemoSignal, MemoSource } from "@/features/memo-required-checker/types";

export const BEST_EFFORT_NOTICE =
  "Best-effort only. SEP-29 is a self-declared data entry, so a missing signal is not a guarantee that a memo is unnecessary.";

export function formatVerdict(verdict: "required" | "not_required"): string {
  return verdict === "required" ? copy.verdictRequired : copy.verdictNotRequired;
}

export function formatSignal(signal: MemoSignal): string {
  if (signal === "required") return copy.signalRequired;
  if (signal === "not_required") return copy.signalNotRequired;
  return copy.signalAbsent;
}

export function formatSources(sources: MemoSource[]): string {
  if (sources.length === 0) return copy.sourcesNone;
  return sources
    .map((source) => (source === "data_entry" ? copy.sourceDataEntry : copy.sourceToml))
    .join(", ");
}
