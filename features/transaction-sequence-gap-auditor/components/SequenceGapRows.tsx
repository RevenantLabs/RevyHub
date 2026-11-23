import { copy } from "@/features/transaction-sequence-gap-auditor/copy";
import {
  formatGapKind,
  formatMissingCount,
  formatSequence,
  shortenHash
} from "@/features/transaction-sequence-gap-auditor/lib/format";
import type { SequenceGap } from "@/features/transaction-sequence-gap-auditor/types";

export function SequenceGapRows({ gaps }: { gaps: SequenceGap[] }) {
  if (gaps.length === 0) {
    return <p className="text-sm text-[#4e5c73]">{copy.noGaps}</p>;
  }

  return (
    <ul className="space-y-3">
      {gaps.map((gap) => (
        <li
          key={`${gap.afterHash}:${gap.beforeHash}`}
          className="rounded-lg border border-[#dbe4f0] bg-white/60 p-4"
        >
          <h3 className="font-bold text-[#172033]">{formatGapKind(gap.kind)}</h3>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-[#68758a]">{copy.afterSequence}</dt>
              <dd className="break-all font-mono">{formatSequence(gap.afterSequence)}</dd>
            </div>
            <div>
              <dt className="text-[#68758a]">{copy.beforeSequence}</dt>
              <dd className="break-all font-mono">{formatSequence(gap.beforeSequence)}</dd>
            </div>
            <div>
              <dt className="text-[#68758a]">{copy.missing}</dt>
              <dd>{formatMissingCount(gap.missingCount)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-[#4e5c73]">
            <span className="font-semibold">{copy.evidence}: </span>
            {gap.kind === "proved_bump" && gap.bumpTo && gap.bumpTransactionHash
              ? copy.bumpEvidence(shortenHash(gap.bumpTransactionHash), gap.bumpTo)
              : copy.noBumpEvidence}
          </p>
        </li>
      ))}
    </ul>
  );
}
