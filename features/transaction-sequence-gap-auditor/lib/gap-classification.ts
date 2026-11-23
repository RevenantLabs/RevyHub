import { compareSequence } from "@/features/transaction-sequence-gap-auditor/lib/sequence-window";
import type {
  SequenceEvidence,
  SequenceGap
} from "@/features/transaction-sequence-gap-auditor/types";

export function classifyGaps(
  sequences: SequenceEvidence[],
  bumpTargets: Map<string, string>,
  incompleteEvidence = false
): SequenceGap[] {
  const ordered = [...sequences].sort(compareSequence);
  const gaps: SequenceGap[] = [];

  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1]!;
    const current = ordered[index]!;
    const previousSequence = BigInt(previous.sequence);
    const currentSequence = BigInt(current.sequence);
    if (currentSequence <= previousSequence + 1n) continue;

    const bumpTo = previous.successful ? bumpTargets.get(previous.hash) : undefined;
    const provedBump = bumpTo !== undefined && BigInt(bumpTo) === currentSequence;
    const kind = provedBump
      ? "proved_bump"
      : incompleteEvidence && index === 1
        ? "unexplained_truncated"
        : "unexplained";

    gaps.push({
      afterSequence: previous.sequence,
      beforeSequence: current.sequence,
      missingCount: (currentSequence - previousSequence - 1n).toString(),
      kind,
      afterHash: previous.hash,
      beforeHash: current.hash,
      ...(provedBump ? { bumpTo, bumpTransactionHash: previous.hash } : {})
    });
  }

  return gaps;
}
