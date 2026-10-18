import { copy } from "@/features/signature-hint-auditor/copy";
import {
  formatHint,
  formatIndex,
  formatMatchKind
} from "@/features/signature-hint-auditor/lib/format";
import type { HintCandidateMatch } from "@/features/signature-hint-auditor/types";

/**
 * Ordered decorated-signature rows for one envelope group.
 *
 * Every candidate label is framed as a hint match so the UI never implies
 * cryptographic verification.
 */
export function SignatureRows({
  signatures,
  groupTitle
}: {
  signatures: HintCandidateMatch[];
  groupTitle: string;
}) {
  if (!signatures.length) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-[#172033]">{groupTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-[#4e5c73]">{copy.noSignatures}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-[#172033]">{groupTitle}</h3>
      <ol className="mt-3 space-y-3">
        {signatures.map((signature) => (
          <li
            key={`${signature.group}-${signature.index}-${signature.hint}`}
            className="rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-3"
          >
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
              <span className="font-mono text-xs text-[#8a98aa]">
                {formatIndex(signature.index)}
              </span>
              <span>
                <span className="text-[#68758a]">{copy.labelHint}: </span>
                <span className="font-mono text-[#172033]">{formatHint(signature.hint)}</span>
              </span>
              <span>
                <span className="text-[#68758a]">{copy.labelMatchKind}: </span>
                <span className="font-semibold text-[#172033]">
                  {formatMatchKind(signature.matchKind)}
                </span>
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#68758a]">
              {signature.matchKind === "none"
                ? copy.unmatchedLabel
                : signature.matchKind === "single"
                  ? copy.oneCandidate
                  : copy.collisionLabel}
            </p>
            {signature.candidates.length ? (
              <ul className="mt-2 space-y-1">
                {signature.candidates.map((candidate) => (
                  <li key={candidate} className="break-all font-mono text-xs text-[#172033]">
                    {candidate}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
