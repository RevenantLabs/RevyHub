import type { ActivityOperation } from "@/features/account-activity-rollup/types";

/** Counts fetched pages, but counts each paging token only once in the aggregate. */
export function collectPage(previous: ActivityOperation[], page: ActivityOperation[]): ActivityOperation[] {
  const seen = new Set(previous.map((record) => record.pagingToken));
  const merged = [...previous];
  for (const record of page) {
    if (seen.has(record.pagingToken)) continue;
    seen.add(record.pagingToken);
    merged.push(record);
  }
  return merged;
}

export function nextPageCursor(page: ActivityOperation[], priorCursor: string | null, previous: ActivityOperation[] = []): string | null {
  const cursor = page.at(-1)?.pagingToken ?? null;
  // Descending Horizon pages must move toward smaller tokens. An overlapping
  // or replayed page must not send the browser around the same cursor again.
  return cursor && !previous.some((record) => record.pagingToken === cursor) &&
    (priorCursor === null || BigInt(cursor) < BigInt(priorCursor)) ? cursor : null;
}
