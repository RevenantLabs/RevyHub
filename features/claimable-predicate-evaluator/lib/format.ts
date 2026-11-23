/** Display identifiers and decimal amounts without Number conversion or truncation. */
export function displayExact(value: string | null): string { return value ?? "—"; }
export function formatVerdict(value: "true" | "false" | "unknown"): string {
  return copy.verdictNames[value];
}
import { copy } from "@/features/claimable-predicate-evaluator/copy";
