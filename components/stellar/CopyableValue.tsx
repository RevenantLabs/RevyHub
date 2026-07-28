"use client";

import { Copy, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { copyText } from "@/lib/copy";
import { redactValue, truncateMiddle } from "@/lib/utils";
import { useRedaction } from "@/components/stellar/RedactionProvider";

interface CopyableValueProps {
  label: string;
  value: string;
  visible?: number;
}

export function CopyableValue({ label, value, visible = 6 }: CopyableValueProps) {
  const { redacted } = useRedaction();
  const [copied, setCopied] = useState(false);

  const displayValue = redacted ? redactValue(value) : truncateMiddle(value, visible);
  const screenReaderLabel = redacted ? `Redacted ${label}` : `${label}: ${value}`;
  const copyDisabled = redacted;

  async function handleCopy() {
    if (copyDisabled) return;
    await copyText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <span className="inline-flex max-w-full items-center gap-2">
      <span
        title={redacted ? `Redacted ${label}` : value}
        className="min-w-0 truncate"
        aria-label={screenReaderLabel}
      >
        {redacted ? (
          <span className="inline-flex items-center gap-1.5 text-[#8a98aa]">
            <EyeOff className="h-3 w-3" aria-hidden />
            {displayValue}
          </span>
        ) : (
          displayValue
        )}
      </span>
      <Button
        type="button"
        variant="ghost"
        onClick={handleCopy}
        disabled={copyDisabled}
        className="min-h-8 shrink-0 rounded-md px-2 py-1 text-xs"
        aria-label={copyDisabled ? `Copy disabled while privacy mode is active` : `Copy ${label}`}
        title={copyDisabled ? "Copy disabled in privacy mode" : undefined}
      >
        <Copy className="h-3.5 w-3.5" aria-hidden />
        {copied ? "Copied" : copyDisabled ? "Locked" : "Copy"}
      </Button>
    </span>
  );
}
