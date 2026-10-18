import { err, ok, type Result } from "@/core/result/result";
import type {
  HorizonLedgerRecord,
  LedgerCloseCadenceErrorCode,
  ValidatedLedger
} from "@/features/ledger-close-cadence/types";

/**
 * Parses a Horizon ledger record into a validated close observation.
 * Malformed records return null so callers can skip without corrupting the sample.
 */
export function parseLedgerRecord(record: HorizonLedgerRecord): ValidatedLedger | null {
  if (!record || typeof record !== "object") return null;

  const sequenceRaw = record.sequence;
  const closedAtRaw = record.closed_at;

  if (sequenceRaw === undefined || sequenceRaw === null) return null;
  if (typeof closedAtRaw !== "string" || !closedAtRaw.trim()) return null;

  const sequenceText = String(sequenceRaw).trim();
  if (!/^\d+$/.test(sequenceText)) return null;

  const closedAtMs = Date.parse(closedAtRaw);
  if (!Number.isFinite(closedAtMs)) return null;

  return {
    sequence: sequenceText,
    closedAt: new Date(closedAtMs).toISOString(),
    closedAtMs
  };
}

/**
 * Validates records, drops malformed ones, and sorts ascending by sequence.
 * Duplicate sequences keep the first valid observation.
 */
export function validateAndSortLedgerSample(
  records: HorizonLedgerRecord[]
): Result<
  { ledgers: ValidatedLedger[]; malformedCount: number },
  LedgerCloseCadenceErrorCode
> {
  if (!Array.isArray(records) || records.length === 0) {
    return err("history_unavailable");
  }

  const bySequence = new Map<string, ValidatedLedger>();
  let malformedCount = 0;

  for (const record of records) {
    const parsed = parseLedgerRecord(record);
    if (!parsed) {
      malformedCount += 1;
      continue;
    }
    if (!bySequence.has(parsed.sequence)) {
      bySequence.set(parsed.sequence, parsed);
    }
  }

  const ledgers = [...bySequence.values()].sort((a, b) =>
    a.sequence.length === b.sequence.length
      ? a.sequence < b.sequence
        ? -1
        : a.sequence > b.sequence
          ? 1
          : 0
      : a.sequence.length - b.sequence.length
  );

  if (ledgers.length === 0) {
    return err("malformed_ledger");
  }

  return ok({ ledgers, malformedCount });
}
