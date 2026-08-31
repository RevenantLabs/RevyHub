import type { CodeExplanation, ResultCodeCategory } from "@/features/result-code-explainer/types";

const CATEGORY_LABELS: Record<ResultCodeCategory, string> = {
  transaction: "Transaction",
  operation: "Operation"
};

export function formatCategory(category: ResultCodeCategory): string {
  return CATEGORY_LABELS[category];
}

export function formatCodeLabel(entry: CodeExplanation): string {
  if (entry.operationType) {
    return `${entry.code} (${entry.operationType})`;
  }
  return entry.code;
}

export function formatOperationHeading(index: number, operationType: string | null): string {
  const position = `#${index + 1}`;
  if (!operationType) return `Operation ${position}`;
  return `Operation ${position} — ${operationType.replace(/_/g, " ")}`;
}

export function formatFeeCharged(fee: string): string {
  return `${fee} stroops`;
}

/** Filters explanations for display; empty search returns the full list. */
export function filterExplanations(
  explanations: CodeExplanation[],
  search: string
): CodeExplanation[] {
  const query = search.trim().toLowerCase();
  if (!query) return explanations;

  return explanations.filter((entry) => {
    const haystack = [entry.code, entry.title, entry.cause, entry.fix, entry.operationType ?? ""]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}
