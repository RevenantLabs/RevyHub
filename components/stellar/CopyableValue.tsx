"use client";

import { Copy } from "lucide-react";
import { useId, useState } from "react";
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
  const fullValueId = useId();

  const displayValue = redacted ? redactValue(value) : truncateMiddle(value, visible);
  const screenReaderLabel = redacted ? `Redacted ${label}` : `${label}: ${value}`;
  const copyDisabled = redacted;

  async function handleCopy() {
    try {
      await copyText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <span className="inline-flex max-w-full items-center gap-2">
      <span id={fullValueId} className="sr-only">
        {screenReaderLabel}
      </span>
      <span
        title={redacted ? `Redacted ${label}` : value}
        aria-label={screenReaderLabel}
        aria-describedby={fullValueId}
        className="min-w-0 truncate"
      >
        {displayValue}
      </span>
      <Button
        type="button"
        variant="ghost"
        onClick={handleCopy}
        disabled={copyDisabled}
        className="min-h-8 shrink-0 rounded-md px-2 py-1 text-xs"
        aria-label={copyDisabled ? "Copy disabled while privacy mode is active" : `Copy ${label}`}
        aria-describedby={fullValueId}
      >
        <Copy className="h-3.5 w-3.5" aria-hidden />
        {copied ? "Copied" : copyDisabled ? "Locked" : "Copy"}
      </Button>
    </span>
  );
}
