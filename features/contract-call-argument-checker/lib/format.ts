import type { ArgumentReport } from "../types";

export function stableJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function formatMismatch(path: string, expected: string, actual: string): string {
  return `${path}: expected ${expected}, actual ${actual}`;
}

export function formatReport(report: ArgumentReport): string {
  return stableJson({ selected: report.selected, mismatches: report.mismatches });
}
