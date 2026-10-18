import { CopyableValue } from "@/core/ui/CopyableValue";
import { copy } from "@/features/signature-hint-auditor/copy";
import { formatHint } from "@/features/signature-hint-auditor/lib/format";
import type { PublicSignerHint } from "@/features/signature-hint-auditor/types";

/** Lists optional public keys and the hints derived from them. */
export function CandidateRows({ signers }: { signers: PublicSignerHint[] }) {
  if (!signers.length) {
    return <p className="text-sm leading-6 text-[#4e5c73]">{copy.noSignersProvided}</p>;
  }

  return (
    <ul className="space-y-3">
      {signers.map((signer) => (
        <li
          key={signer.publicKey}
          className="rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-3 text-sm"
        >
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#8a98aa]">
                {copy.labelSignerKey}
              </p>
              <CopyableValue label="public key" value={signer.publicKey} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#8a98aa]">
                {copy.labelSignerHint}
              </p>
              <p className="font-mono text-[#172033]">{formatHint(signer.hint)}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
