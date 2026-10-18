import type { ActivityOperation, CoverageWindow } from "@/features/account-activity-rollup/types";

/** Bounds describe fetched, unique records only; they are never an all-time total. */
export function describeHistory(operations: ActivityOperation[], pages: number, hasMore: boolean): CoverageWindow {
  const days = operations.map((record) => record.createdAt.slice(0, 10)).sort();
  return { newestDay: days.at(-1) ?? null, oldestDay: days[0] ?? null, pages, records: operations.length, hasMore };
}
