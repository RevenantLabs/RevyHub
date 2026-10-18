import type {
  ProtocolLedger,
  ProtocolTransition,
  SequenceGap
} from "@/features/ledger-protocol-transition-map/types";

export function detectSequenceGaps(ledgers: ProtocolLedger[]): SequenceGap[] {
  const gaps: SequenceGap[] = [];

  for (let index = 1; index < ledgers.length; index += 1) {
    const previous = ledgers[index - 1]!;
    const current = ledgers[index]!;
    const expected = BigInt(previous.sequence) + 1n;
    const actual = BigInt(current.sequence);

    if (actual > expected) {
      gaps.push({
        afterSequence: previous.sequence,
        beforeSequence: current.sequence,
        missingCount: (actual - expected).toString()
      });
    }
  }

  return gaps;
}

/**
 * Exact transitions require both adjacent sequence numbers to have been fetched.
 * A gap makes the boundary uncertain instead of inventing the upgrade ledger.
 */
export function classifyTransitions(ledgers: ProtocolLedger[]): ProtocolTransition[] {
  const transitions: ProtocolTransition[] = [];

  for (let index = 1; index < ledgers.length; index += 1) {
    const previous = ledgers[index - 1]!;
    const current = ledgers[index]!;

    if (previous.protocolVersion === current.protocolVersion) continue;

    const adjacent = BigInt(current.sequence) === BigInt(previous.sequence) + 1n;

    transitions.push({
      fromVersion: previous.protocolVersion,
      toVersion: current.protocolVersion,
      beforeSequence: previous.sequence,
      afterSequence: current.sequence,
      certainty: adjacent ? "exact" : "uncertain",
      reason: adjacent ? "adjacent" : "sequence_gap"
    });
  }

  return transitions;
}
