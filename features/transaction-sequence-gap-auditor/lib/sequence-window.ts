import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import {
  HorizonResponseError,
  PageDecodeError
} from "@/features/transaction-sequence-gap-auditor/lib/transactionSequenceGapAuditor.errors";
import {
  INT64_MAX,
  MAX_PAGES,
  MAX_TRANSACTIONS,
  PAGE_SIZE,
  type ErrorCode,
  type HorizonTransactionRecord,
  type SequenceEvidence
} from "@/features/transaction-sequence-gap-auditor/types";

const DIGITS = /^[0-9]+$/;

export interface SequenceWindow {
  records: SequenceEvidence[];
  pagesFetched: number;
  limitReached: boolean;
  nextCursor: string | null;
}

function decimal(value: unknown): string | null {
  if (typeof value === "string" && DIGITS.test(value)) return value;
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) return String(value);
  return null;
}

export function parseTransactionRecord(
  raw: HorizonTransactionRecord,
  accountId: string,
  pageIndex: number
): SequenceEvidence | null {
  const sequence = decimal(raw.source_account_sequence);
  const pagingToken = decimal(raw.paging_token);
  const ledger = decimal(raw.ledger);
  const createdAtMs = typeof raw.created_at === "string" ? Date.parse(raw.created_at) : NaN;
  if (
    typeof raw.hash !== "string" ||
    !raw.hash ||
    raw.source_account !== accountId ||
    !sequence ||
    BigInt(sequence) > INT64_MAX ||
    !pagingToken ||
    !ledger ||
    typeof raw.successful !== "boolean" ||
    !Number.isFinite(createdAtMs)
  ) {
    return null;
  }

  const operationCount = decimal(raw.operation_count);
  if (raw.operation_count !== undefined && operationCount === null) return null;

  return {
    sequence,
    hash: raw.hash,
    successful: raw.successful,
    pagingToken,
    ledger,
    createdAt: raw.created_at as string,
    pageIndex,
    ...(operationCount === null ? {} : { operationCount: Number(operationCount) })
  };
}

export function compareSequence(left: SequenceEvidence, right: SequenceEvidence): number {
  const a = BigInt(left.sequence);
  const b = BigInt(right.sequence);
  return a < b ? -1 : a > b ? 1 : 0;
}

export function normalizeSequenceWindow(
  records: HorizonTransactionRecord[],
  accountId: string,
  pageIndex: number
): Result<SequenceEvidence[], ErrorCode> {
  if (records.length > PAGE_SIZE) return err("too_large");
  const seen = new Set<string>();
  const normalized: SequenceEvidence[] = [];
  for (const raw of records) {
    const parsed = parseTransactionRecord(raw, accountId, pageIndex);
    if (!parsed) return err("malformed_data");
    if (seen.has(parsed.pagingToken)) continue;
    seen.add(parsed.pagingToken);
    normalized.push(parsed);
  }
  return ok(normalized);
}

function pageRecords(value: unknown): HorizonTransactionRecord[] {
  if (typeof value !== "object" || value === null) throw new PageDecodeError("malformed_data");
  const embedded = (value as { _embedded?: unknown })._embedded;
  if (typeof embedded !== "object" || embedded === null) {
    throw new PageDecodeError("malformed_data");
  }
  const records = (embedded as { records?: unknown }).records;
  if (!Array.isArray(records)) throw new PageDecodeError("malformed_data");
  return records as HorizonTransactionRecord[];
}

export async function fetchTransactionPages(
  accountId: string,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<SequenceWindow> {
  const byToken = new Map<string, SequenceEvidence>();
  let cursor: string | undefined;
  let pagesFetched = 0;
  let lastPageFull = false;

  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex += 1) {
    const response = await fetch(
      horizonUrl(network, `/accounts/${accountId}/transactions`, {
        order: "desc",
        limit: PAGE_SIZE,
        include_failed: "true",
        cursor
      }),
      { signal, headers: { Accept: "application/json" } }
    );
    if (!response.ok) throw new HorizonResponseError(response.status);

    const rawRecords = pageRecords(await response.json());
    if (rawRecords.length > PAGE_SIZE) throw new PageDecodeError("too_large");
    const normalized = normalizeSequenceWindow(rawRecords, accountId, pageIndex);
    if (!normalized.ok) throw new PageDecodeError(normalized.code as "malformed_data" | "too_large");

    pagesFetched += 1;
    lastPageFull = rawRecords.length === PAGE_SIZE;
    let added = 0;
    for (const record of normalized.value) {
      if (!byToken.has(record.pagingToken) && byToken.size < MAX_TRANSACTIONS) {
        byToken.set(record.pagingToken, record);
        added += 1;
      }
    }

    if (rawRecords.length < PAGE_SIZE || added === 0) break;
    cursor = normalized.value.at(-1)?.pagingToken;
    if (!cursor) break;
  }

  const records = [...byToken.values()].sort(compareSequence);
  const limitReached = pagesFetched === MAX_PAGES && lastPageFull;
  return {
    records,
    pagesFetched,
    limitReached,
    nextCursor: limitReached ? records[0]?.pagingToken ?? cursor ?? null : null
  };
}
