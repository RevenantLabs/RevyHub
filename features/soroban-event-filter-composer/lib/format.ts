import type { EventFilterReport } from "../types";

export function stableJson(value: unknown): string {
  const normalize = (item: unknown): unknown => {
    if (typeof item === "bigint") return item.toString();
    if (Array.isArray(item)) return item.map(normalize);
    if (item !== null && typeof item === "object") {
      return Object.fromEntries(
        Object.entries(item)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([key, nested]) => [key, normalize(nested)])
      );
    }
    return item;
  };
  return JSON.stringify(normalize(value), null, 2);
}

export function formatFilter(report: Pick<EventFilterReport, "filter">): string {
  return stableJson(report.filter);
}

export function formatLedgerPair(oldest: string, latest: string): string {
  return `${oldest}–${latest}`;
}
