import type { ActivityGroup, ActivityOperation } from "@/features/account-activity-rollup/types";

export function groupByType(operations: ActivityOperation[]): ActivityGroup[] {
  const counts = new Map<string, number>();
  for (const record of operations) counts.set(record.type, (counts.get(record.type) ?? 0) + 1);
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}

export function groupByUtcDay(operations: ActivityOperation[]): ActivityGroup[] {
  const counts = new Map<string, number>();
  for (const record of operations) {
    const day = record.createdAt.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.key.localeCompare(a.key));
}
