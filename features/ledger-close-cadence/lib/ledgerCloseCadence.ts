import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { calculateCadenceStats } from "@/features/ledger-close-cadence/lib/cadence-stats";
import {
  HorizonStatusError,
  toLedgerCloseCadenceErrorCode
} from "@/features/ledger-close-cadence/lib/ledgerCloseCadence.errors";
import { validateAndSortLedgerSample } from "@/features/ledger-close-cadence/lib/ledger-sample";
import { detectSequenceGaps } from "@/features/ledger-close-cadence/lib/sequence-gaps";
import {
  UNUSUAL_INTERVAL_MEDIAN_MULTIPLE,
  type HorizonLedgerRecord,
  type LedgerCloseCadenceErrorCode,
  type LedgerCloseCadenceInput,
  type LedgerCloseCadenceResult,
  type LedgerInterval,
  type ValidatedLedger
} from "@/features/ledger-close-cadence/types";

const REQUEST_TIMEOUT_MS = 15_000;

interface HorizonLedgerPage {
  _embedded?: { records?: HorizonLedgerRecord[] };
  records?: HorizonLedgerRecord[];
}

function recordsFromPage(page: HorizonLedgerPage): HorizonLedgerRecord[] {
  if (Array.isArray(page._embedded?.records)) return page._embedded.records;
  if (Array.isArray(page.records)) return page.records;
  return [];
}

export function buildIntervals(
  ledgers: ValidatedLedger[],
  medianMs: number | null
): { intervals: LedgerInterval[]; repeatedTimestampCount: number } {
  const intervals: LedgerInterval[] = [];
  let repeatedTimestampCount = 0;
  const unusualThreshold =
    medianMs === null ? Number.POSITIVE_INFINITY : medianMs * UNUSUAL_INTERVAL_MEDIAN_MULTIPLE;

  for (let index = 1; index < ledgers.length; index += 1) {
    const from = ledgers[index - 1]!;
    const to = ledgers[index]!;
    const durationMs = to.closedAtMs - from.closedAtMs;
    const repeatedTimestamp = durationMs === 0;

    if (repeatedTimestamp) repeatedTimestampCount += 1;

    intervals.push({
      fromSequence: from.sequence,
      toSequence: to.sequence,
      fromClosedAt: from.closedAt,
      toClosedAt: to.closedAt,
      durationMs,
      unusual: durationMs > unusualThreshold,
      repeatedTimestamp
    });
  }

  return { intervals, repeatedTimestampCount };
}

export function analyzeLedgerSample(
  records: HorizonLedgerRecord[],
  input: LedgerCloseCadenceInput,
  network: StellarNetwork
): Result<LedgerCloseCadenceResult, LedgerCloseCadenceErrorCode> {
  const validated = validateAndSortLedgerSample(records);
  if (!validated.ok) return validated;

  const { ledgers, malformedCount } = validated.value;
  if (ledgers.length < 2) {
    return err("malformed_ledger");
  }

  const preliminaryDurations: number[] = [];
  for (let index = 1; index < ledgers.length; index += 1) {
    preliminaryDurations.push(ledgers[index]!.closedAtMs - ledgers[index - 1]!.closedAtMs);
  }

  const stats = calculateCadenceStats(preliminaryDurations);
  if (!stats) return err("malformed_ledger");

  const { intervals, repeatedTimestampCount } = buildIntervals(ledgers, stats.medianMs);

  return ok({
    network,
    requestedSampleSize: input.sampleSize,
    observedSampleSize: ledgers.length,
    firstLedger: ledgers[0]!,
    lastLedger: ledgers[ledgers.length - 1]!,
    intervals,
    stats,
    sequenceGaps: detectSequenceGaps(ledgers),
    malformedCount,
    repeatedTimestampCount
  });
}

export async function runLedgerCloseCadence(
  input: LedgerCloseCadenceInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<LedgerCloseCadenceResult, LedgerCloseCadenceErrorCode>> {
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort();
  if (signal?.aborted) abortFromCaller();
  else signal?.addEventListener("abort", abortFromCaller, { once: true });
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      horizonUrl(network, "/ledgers", { order: "desc", limit: input.sampleSize }),
      {
        signal: controller.signal,
        headers: { Accept: "application/json" }
      }
    );

    if (!response.ok) {
      throw new HorizonStatusError(response.status);
    }

    const page = (await response.json()) as HorizonLedgerPage;
    return analyzeLedgerSample(recordsFromPage(page), input, network);
  } catch (error) {
    return err(toLedgerCloseCadenceErrorCode(error));
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}
