import { copy } from "@/features/strkey-corruption-locator/copy";
import { formatKind, formatSubstitution } from "@/features/strkey-corruption-locator/lib/format";
import type { CorrectionCandidate } from "@/features/strkey-corruption-locator/types";

/** Ranked corrections. The changed character is named in text, not by color alone. */
export function CandidateRows({ candidates }: { candidates: readonly CorrectionCandidate[] }) {
  if (candidates.length === 0) return null;

  return (
    <ol aria-label={copy.candidateListLabel} className="min-w-0 space-y-3">
      {candidates.map((candidate) => (
        <li
          key={`${candidate.position}-${candidate.replacement}-${candidate.kind}`}
          className="min-w-0 rounded-md border border-[#e3ebf5] bg-white/70 p-3"
        >
          <p className="text-sm font-bold text-[#172033]">{formatSubstitution(candidate)}</p>
          <p className="mt-1 break-all font-mono text-xs leading-5 text-[#172033] sm:text-sm">
            {candidate.corrected}
          </p>
          <p className="mt-1 text-xs text-[#4e5c73]">{formatKind(candidate.kind)}</p>
        </li>
      ))}
    </ol>
  );
}
