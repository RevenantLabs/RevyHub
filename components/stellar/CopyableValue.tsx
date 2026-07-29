"use client";

import { Copy } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { copyText } from "@/lib/copy";
import { truncateMiddle } from "@/lib/utils";

interface CopyableValueProps {
  label: string;
  value: string;
  visible?: number;
}

export function CopyableValue({ label, value, visible = 6 }: CopyableValueProps) {
  const [copied, setCopied] = useState(false);
  const fullValueId = useId();

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
        {label}: {value}
      </span>
      <span title={value} aria-describedby={fullValueId} className="min-w-0 truncate">
        {truncateMiddle(value, visible)}
      </span>
      <Button
        type="button"
        variant="ghost"
        onClick={handleCopy}
        className="min-h-8 shrink-0 rounded-md px-2 py-1 text-xs"
        aria-label={`Copy ${label}`}
        aria-describedby={fullValueId}
      >
        <Copy className="h-3.5 w-3.5" aria-hidden />
        {copied ? "Copied" : "Copy"}
      </Button>
    </span>
  );
}
