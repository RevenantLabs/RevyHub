import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { classifyGaps } from "@/features/transaction-sequence-gap-auditor/lib/gap-classification";
import { fetchTransactionPages } from "@/features/transaction-sequence-gap-auditor/lib/sequence-window";
import {
  HorizonResponseError,
  PageDecodeError,
  toTransactionSequenceGapAuditorErrorCode
} from "@/features/transaction-sequence-gap-auditor/lib/transactionSequenceGapAuditor.errors";
import {
  INT64_MAX,
  PAGE_SIZE,
  REQUEST_TIMEOUT_MS,
  type AuditorInput,
  type AuditorResult,
  type ErrorCode,
  type HorizonOperationRecord,
  type SequenceEvidence
} from "@/features/transaction-sequence-gap-auditor/types";

const DIGITS = /^[0-9]+$/;

function potentialGapPredecessors(records: SequenceEvidence[]): SequenceEvidence[] {
  return records.filter((record, index) => {
    const next = records[index + 1];
    return (
      record.successful &&
      next !== undefined &&
      BigInt(next.sequence) > BigInt(record.sequence) + 1n
    );
  });
}

async function fetchBumpTarget(
  transaction: SequenceEvidence,
  accountId: string,
  network: StellarNetwork,
  signal: AbortSignal
): Promise<string | null> {
  const response = await fetch(
    horizonUrl(network, `/transactions/${transaction.hash}/operations`, { limit: PAGE_SIZE }),
    { signal, headers: { Accept: "application/json" } }
  );
  if (!response.ok) throw new HorizonResponseError(response.status);
  const body = (await response.json()) as { _embedded?: { records?: unknown } };
  const records = body?._embedded?.records;
  if (!Array.isArray(records) || records.length > PAGE_SIZE) {
    throw new PageDecodeError(records && records.length > PAGE_SIZE ? "too_large" : "malformed_data");
  }

  for (const raw of records as HorizonOperationRecord[]) {
    if (typeof raw !== "object" || raw === null || typeof raw.type !== "string") {
      throw new PageDecodeError("malformed_data");
    }
    if (raw.type !== "bump_sequence" || raw.source_account !== accountId) continue;
    if (typeof raw.bump_to !== "string" || !DIGITS.test(raw.bump_to) || BigInt(raw.bump_to) > INT64_MAX) {
      throw new PageDecodeError("malformed_data");
    }
    return raw.bump_to;
  }
  return null;
}

export async function runTransactionSequenceGapAuditor(
  input: AuditorInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<AuditorResult, ErrorCode>> {
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort();
  if (signal?.aborted) abortFromCaller();
  else signal?.addEventListener("abort", abortFromCaller, { once: true });
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const window = await fetchTransactionPages(input.accountId, network, controller.signal);
    const bumpTargets = new Map<string, string>();
    for (const transaction of potentialGapPredecessors(window.records)) {
      const bumpTo = await fetchBumpTarget(transaction, input.accountId, network, controller.signal);
      if (bumpTo) bumpTargets.set(transaction.hash, bumpTo);
    }

    const gaps = classifyGaps(window.records, bumpTargets, window.limitReached);
    const truncatedGapCount = gaps.filter((gap) => gap.kind === "unexplained_truncated").length;
    const successfulCount = window.records.filter((record) => record.successful).length;
    const failedCount = window.records.length - successfulCount;
    const result: AuditorResult = {
      coverage: {
        network,
        accountId: input.accountId,
        pagesFetched: window.pagesFetched,
        transactionCount: window.records.length,
        successfulCount,
        failedCount,
        oldestSequence: window.records[0]?.sequence ?? null,
        newestSequence: window.records.at(-1)?.sequence ?? null,
        limitReached: window.limitReached,
        incompleteEvidence: window.limitReached || truncatedGapCount > 0,
        nextCursor: window.nextCursor
      },
      sequences: window.records,
      gaps,
      provedBumpCount: gaps.filter((gap) => gap.kind === "proved_bump").length,
      unexplainedCount: gaps.filter((gap) => gap.kind === "unexplained").length,
      truncatedGapCount
    };
    return ok(result);
  } catch (error) {
    return err(toTransactionSequenceGapAuditorErrorCode(error));
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}
