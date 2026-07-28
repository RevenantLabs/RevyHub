"use client";

import { Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { copyText } from "@/lib/copy";
import { truncateMiddle } from "@/lib/utils";
import { useRedaction } from "@/components/stellar/RedactionProvider";
import { redactValue, redactedAriaLabel } from "@/lib/redaction";

interface CopyableValueProps {
  label: string;
  value: string;
  visible?: number;
}

export function CopyableValue({ label, value, visible = 6 }: CopyableValueProps) {
  const [copied, setCopied] = useState(false);
  const [confirmCopy, setConfirmCopy] = useState(false);
  const copiedRef = useRef<number | undefined>(undefined);
  const confirmRef = useRef<number | undefined>(undefined);
  const { redacted } = useRedaction();

  useEffect(() => {
    return () => {
      window.clearTimeout(copiedRef.current);
      window.clearTimeout(confirmRef.current);
    };
  }, []);

  const displayValue = redacted ? redactValue(value, label) : truncateMiddle(value, visible);

  async function handleCopy() {
    if (redacted && !confirmCopy) {
      setConfirmCopy(true);
      confirmRef.current = window.setTimeout(() => setConfirmCopy(false), 3000);
      return;
    }

    await copyText(value);
    setCopied(true);
    setConfirmCopy(false);
    window.clearTimeout(confirmRef.current);
    copiedRef.current = window.setTimeout(() => setCopied(false), 1600);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      setConfirmCopy(false);
    }
  }

  return (
    <span className="inline-flex max-w-full items-center gap-2">
      <span
        title={redacted ? undefined : value}
        className="min-w-0 truncate"
        aria-label={redacted ? redactedAriaLabel(label) : value}
      >
        {displayValue}
      </span>
      <Button
        type="button"
        variant="ghost"
        onClick={handleCopy}
        onKeyDown={handleKeyDown}
        className="min-h-8 shrink-0 rounded-md px-2 py-1 text-xs"
        aria-label={
          redacted
            ? confirmCopy
              ? `Confirm copy ${label} — click again to copy the real value`
              : `Copy ${label} disabled while redaction is active`
            : `Copy ${label}`
        }
      >
        <Copy className="h-3.5 w-3.5" aria-hidden />
        {copied ? "Copied" : confirmCopy ? "Sure?" : "Copy"}
      </Button>
    </span>
  );
}
