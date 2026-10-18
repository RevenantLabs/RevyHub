import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toOperationBrowserErrorCode } from "@/features/operation-browser/lib/operationBrowser.errors";
import { extractOperationParams } from "@/features/operation-browser/lib/format";
import type {
  OperationBrowserErrorCode,
  OperationBrowserInput,
  OperationBrowserResult,
  OperationSummary
} from "@/features/operation-browser/types";

export const PAGE_SIZE = 20;

interface HorizonCollection<T> {
  _embedded: { records: T[] };
}

export interface RawHorizonOperation extends Record<string, unknown> {
  id: string;
  paging_token: string;
  type: string;
  source_account: string;
  created_at: string;
  transaction_hash: string;
  transaction_successful: boolean;
}

async function requestOperations(
  network: StellarNetwork,
  accountId: string,
  cursor: string | undefined,
  signal?: AbortSignal
): Promise<RawHorizonOperation[]> {
  const response = await fetch(
    horizonUrl(network, `/accounts/${encodeURIComponent(accountId)}/operations`, {
      order: "desc",
      limit: PAGE_SIZE,
      cursor
    }),
    { signal, headers: { Accept: "application/json" } }
  );

  if (!response.ok) {
    throw Object.assign(new Error("Horizon request failed."), { status: response.status });
  }

  const page = (await response.json()) as HorizonCollection<RawHorizonOperation>;
  return page._embedded.records;
}

/** Normalises one Horizon operation record into the slice's summary shape. */
export function normalizeHorizonOperation(record: RawHorizonOperation): OperationSummary {
  return {
    id: record.id,
    pagingToken: record.paging_token,
    type: record.type,
    sourceAccount: record.source_account,
    createdAt: record.created_at,
    transactionHash: record.transaction_hash,
    transactionSuccessful: record.transaction_successful,
    params: extractOperationParams(record)
  };
}

export function pageHasMoreOlder(operations: OperationSummary[]): boolean {
  return operations.length === PAGE_SIZE;
}

/** Fetches one page of operations for an account, newest first. */
export async function fetchOperationPage(
  accountId: string,
  network: StellarNetwork,
  cursor?: string,
  signal?: AbortSignal
): Promise<{ operations: OperationSummary[]; hasMoreOlder: boolean }> {
  const records = await requestOperations(network, accountId, cursor, signal);
  const operations = records.map(normalizeHorizonOperation);
  return { operations, hasMoreOlder: pageHasMoreOlder(operations) };
}

export async function runOperationBrowser(
  input: OperationBrowserInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<OperationBrowserResult, OperationBrowserErrorCode>> {
  try {
    const { operations, hasMoreOlder } = await fetchOperationPage(
      input.accountId,
      network,
      undefined,
      signal
    );

    return ok({
      accountId: input.accountId,
      pages: [operations],
      pageIndex: 0,
      hasMoreOlder,
      typeFilter: "all"
    });
  } catch (error) {
    return err(toOperationBrowserErrorCode(error));
  }
}

/** Loads the next older page and appends it to the cached pages. */
export async function loadOlderOperationPage(
  result: OperationBrowserResult,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<OperationBrowserResult, OperationBrowserErrorCode>> {
  const nextIndex = result.pageIndex + 1;

  if (nextIndex < result.pages.length) {
    return ok({ ...result, pageIndex: nextIndex });
  }

  if (!result.hasMoreOlder) {
    return ok(result);
  }

  const oldestPage = result.pages.at(-1) ?? [];
  const cursor = oldestPage.at(-1)?.pagingToken;
  if (!cursor) return ok(result);

  try {
    const { operations, hasMoreOlder } = await fetchOperationPage(
      result.accountId,
      network,
      cursor,
      signal
    );

    return ok({
      ...result,
      pages: [...result.pages, operations],
      pageIndex: nextIndex,
      hasMoreOlder
    });
  } catch (error) {
    return err(toOperationBrowserErrorCode(error));
  }
}

/** Moves back to a newer cached page without a network request. */
export function loadNewerOperationPage(result: OperationBrowserResult): OperationBrowserResult {
  if (result.pageIndex === 0) return result;
  return { ...result, pageIndex: result.pageIndex - 1 };
}
