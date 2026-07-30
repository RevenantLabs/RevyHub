"use client";

import { AlertCircle, Check, Copy } from "lucide-react";
import { useState } from "react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { copyText } from "@/lib/copy";
import { truncateMiddle } from "@/lib/utils";

interface CopyableValueProps {
  label: string;
  value: string;
  visible?: number;
}

type CopyStatus = "idle" | "copied" | "error";

export function CopyableValue({ label, value, visible = 6 }: CopyableValueProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const [copied, setCopied] = useState(false);
  const fullValueId = useId();

  async function handleCopy() {
    try {
      await copyText(value);
      setStatus("copied");
    } catch (error) {
      // Surface failures in UI instead of bubbling an unhandled rejection.
      console.error(`CopyableValue failed to copy ${label}`, error);
      setStatus("error");
    } finally {
      window.setTimeout(() => setStatus("idle"), 1800);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const buttonLabel =
    status === "copied" ? "Copied" : status === "error" ? "Copy failed" : "Copy";
  const StatusIcon =
    status === "copied" ? Check : status === "error" ? AlertCircle : Copy;

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
        onClick={() => {
          void handleCopy();
        }}
        className="min-h-8 shrink-0 rounded-md px-2 py-1 text-xs"
        aria-label={`Copy ${label}`}
        aria-describedby={fullValueId}
      >
        <StatusIcon className="h-3.5 w-3.5" aria-hidden />
        {buttonLabel}
      </Button>
    </span>
  );
}
