"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { copyText } from "@/lib/copy";
import { truncateMiddle } from "@/lib/utils";

interface CopyableValueProps {
  label: string;
  value: string; // raw value to copy and to use as title
  visible?: number;
  display?: string; // optional string to show instead of truncating the raw value
}

export function CopyableValue({ label, value, visible = 6, display }: CopyableValueProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await copyText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <span className="inline-flex max-w-full items-center gap-2">
      <span title={value} className="min-w-0 truncate">
        {display ?? truncateMiddle(value, visible)}
      </span>
      <Button
        type="button"
        variant="ghost"
        onClick={handleCopy}
        className="min-h-8 shrink-0 rounded-md px-2 py-1 text-xs"
        aria-label={`Copy ${label}`}
      >
        <Copy className="h-3.5 w-3.5" aria-hidden />
        {copied ? "Copied" : "Copy"}
      </Button>
    </span>
  );
}
