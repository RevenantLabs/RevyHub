import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { parseAccountActivityRollupInput, parseActivityCursor } from "@/features/account-activity-rollup/schema";
import { toAccountActivityRollupErrorCode } from "@/features/account-activity-rollup/lib/accountActivityRollup.errors";
import { collectPage, nextPageCursor } from "@/features/account-activity-rollup/lib/page-collector";
import { groupByType, groupByUtcDay } from "@/features/account-activity-rollup/lib/activity-groups";
import { describeHistory } from "@/features/account-activity-rollup/lib/history-boundary";
import type { AccountActivityRollupErrorCode, AccountActivityRollupInput, AccountActivityRollupResult, ActivityOperation } from "@/features/account-activity-rollup/types";

export const PAGE_SIZE = 20;

/** Decode the small set of Horizon fields this aggregate needs. */
export function decodeOperationPage(body: unknown): Result<ActivityOperation[], AccountActivityRollupErrorCode> {
  if (!body || typeof body !== "object" || !("_embedded" in body)) return err("history_unavailable");
  const embedded = body._embedded;
  if (!embedded || typeof embedded !== "object" || !("records" in embedded) || !Array.isArray(embedded.records)) return err("history_unavailable");
  const records: ActivityOperation[] = [];
  for (const raw of embedded.records) {
    if (!raw || typeof raw !== "object") return err("history_unavailable");
    const record = raw as Record<string, unknown>;
    if (typeof record.paging_token !== "string" || !/^[0-9]+$/.test(record.paging_token) || typeof record.type !== "string" || !record.type || typeof record.created_at !== "string") return err("history_unavailable");
    const date = new Date(record.created_at);
    if (!Number.isFinite(date.valueOf()) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(record.created_at)) return err("history_unavailable");
    records.push({ pagingToken: record.paging_token, type: record.type, createdAt: date.toISOString() });
  }
  return ok(records);
}

async function fetchPage(accountId: string, network: StellarNetwork, cursor: string | null, signal?: AbortSignal): Promise<Result<ActivityOperation[], AccountActivityRollupErrorCode>> {
  try {
    const response = await fetch(horizonUrl(network, `/accounts/${encodeURIComponent(accountId)}/operations`, {
      order: "desc", limit: PAGE_SIZE, cursor: cursor ?? undefined
    }), { signal, headers: { Accept: "application/json" } });
    if (!response.ok) return err(toAccountActivityRollupErrorCode({ status: response.status }, cursor !== null));
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return err("history_unavailable");
    }
    return decodeOperationPage(body);
  } catch (error) {
    return err(toAccountActivityRollupErrorCode(error, cursor !== null));
  }
}

function makeResult(accountId: string, network: StellarNetwork, previous: AccountActivityRollupResult | null, page: ActivityOperation[]): AccountActivityRollupResult {
  const operations = collectPage(previous?.operations ?? [], page);
  const progressed = operations.length > (previous?.operations.length ?? 0);
  const cursor = page.length === PAGE_SIZE && progressed ? nextPageCursor(page, previous?.cursor ?? null, previous?.operations) : null;
  return {
    accountId, network, operations, cursor,
    byType: groupByType(operations), byDay: groupByUtcDay(operations),
    coverage: describeHistory(operations, (previous?.coverage.pages ?? 0) + 1, cursor !== null)
  };
}

export async function runAccountActivityRollup(input: AccountActivityRollupInput, network: StellarNetwork, signal?: AbortSignal): Promise<Result<AccountActivityRollupResult, AccountActivityRollupErrorCode>> {
  const parsed = parseAccountActivityRollupInput(input.accountId);
  if (!parsed.ok) return parsed;
  const page = await fetchPage(parsed.value.accountId, network, null, signal);
  return page.ok ? ok(makeResult(parsed.value.accountId, network, null, page.value)) : page;
}

export async function loadNextActivityPage(current: AccountActivityRollupResult, network: StellarNetwork, signal?: AbortSignal): Promise<Result<AccountActivityRollupResult, AccountActivityRollupErrorCode>> {
  if (current.network !== network) return err("request_failed");
  const account = parseAccountActivityRollupInput(current.accountId);
  if (!account.ok) return account;
  if (!current.cursor) return ok(current);
  const cursor = parseActivityCursor(current.cursor);
  if (!cursor.ok) return cursor;
  const page = await fetchPage(account.value.accountId, network, cursor.value, signal);
  return page.ok ? ok(makeResult(account.value.accountId, network, current, page.value)) : page;
}
