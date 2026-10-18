import type { SequenceGap, ValidatedLedger } from "@/features/ledger-close-cadence/types";

/**
 * Detects missing sequence numbers between adjacent validated ledgers.
 * Does not infer continuity across pages that were never fetched.
 */
export function detectSequenceGaps(ledgers: ValidatedLedger[]): SequenceGap[] {
  const gaps: SequenceGap[] = [];

  for (let index = 1; index < ledgers.length; index += 1) {
    const previous = ledgers[index - 1]!;
    const current = ledgers[index]!;
    const previousSeq = BigInt(previous.sequence);
    const currentSeq = BigInt(current.sequence);
    const expected = previousSeq + 1n;

    if (currentSeq > expected) {
      gaps.push({
        afterSequence: previous.sequence,
        beforeSequence: current.sequence,
        missingCount: (currentSeq - previousSeq - 1n).toString()
      });
    }
  }

  return gaps;
}
