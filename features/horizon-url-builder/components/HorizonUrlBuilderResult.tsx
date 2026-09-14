import { useState } from "react";
import { Card } from "@/core/ui/Card";
import { copy } from "@/features/horizon-url-builder/copy";
import type { BuiltHorizonUrl } from "@/features/horizon-url-builder/types";

interface Props {
  result: BuiltHorizonUrl;
}

export function HorizonUrlBuilderResult({ result }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-[#172033]">{copy.resultTitle}</h3>

        <div className="flex items-center gap-2">
          <code className="flex-1 break-all rounded-md bg-[#f3f4f6] p-3 text-sm text-[#172033] font-mono">
            {result.url}
          </code>
          <button
            onClick={handleCopy}
            className="text-xs text-[#6366f1] hover:underline whitespace-nowrap"
          >
            {copied ? copy.copied : copy.copyUrl}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-[#68758a]">
          <div><span className="font-medium">Resource:</span> {result.resource}</div>
          <div><span className="font-medium">Network:</span> {result.network}</div>
        </div>
      </div>
    </Card>
  );
}
