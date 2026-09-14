import { useState } from "react";
import { Card } from "@/core/ui/Card";
import { copy } from "@/features/testnet-keypair-generator/copy";
import type { GeneratedKeypair } from "@/features/testnet-keypair-generator/types";

interface Props {
  keypair: GeneratedKeypair;
}

export function KeypairGeneratorResult({ keypair }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-[#172033]">{copy.resultTitle}</h3>

          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-[#68758a]">
              {copy.publicKeyLabel}
            </span>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 break-all rounded-md bg-[#f3f4f6] p-2 text-sm text-[#172033] font-mono">
                {keypair.publicKey}
              </code>
              <button
                onClick={() => handleCopy(keypair.publicKey, "public")}
                className="text-xs text-[#6366f1] hover:underline"
              >
                {copied === "public" ? copy.copied : copy.copyPublic}
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-[#68758a]">
              {copy.seedLabel}
            </span>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 break-all rounded-md bg-[#f3f4f6] p-2 text-sm text-[#172033] font-mono">
                {keypair.seed}
              </code>
              <button
                onClick={() => handleCopy(keypair.seed, "seed")}
                className="text-xs text-[#6366f1] hover:underline"
              >
                {copied === "seed" ? copy.copied : copy.copySeed}
              </button>
            </div>
          </div>
        </div>
      </Card>

      <p className="text-xs text-[#68758a] text-center">{copy.securityNote}</p>
    </div>
  );
}
