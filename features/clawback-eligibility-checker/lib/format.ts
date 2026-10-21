import type { EligibilityVerdict } from "../types";

export function formatVerdictLabel(verdict: EligibilityVerdict): string {
  switch (verdict.kind) {
    case "eligible":
      return "Clawback-eligible";
    case "not_eligible":
      return "Not clawback-eligible";
    case "disagreement":
      return "Signals disagree";
    case "unknown":
      return "Unknown — one or both lookups did not complete";
  }
}
