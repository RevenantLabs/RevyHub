"use client";

import { Copy } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
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

const CONFIRM_RESET_MS = 3000;

export function CopyableValue({ label, value, visible = 6 }: CopyableValueProps) {
  const { redacted } = useRedaction();
  const [copied, setCopied] = useState(false);
  const [confirmCopy, setConfirmCopy] = useState(false);
  const fullValueId = useId();
  const confirmTimer = useRef<number | null>(null);

  const displayed = redacted ? redactValue(value, label) : truncateMiddle(value, visible);
  const valueAriaLabel = redacted ? redactedAriaLabel(label) : `${label}: ${value}`;
  // confirmCopy can only be armed while redaction is on, but gate on both so a
  // stale confirmation is never shown after the mode is toggled off.
  const confirming = redacted && confirmCopy;
  const buttonAriaLabel = confirming
    ? `Confirm copy of ${label}`
    : redacted
      ? `Copy ${label} (confirmation required)`
      : `Copy ${label}`;

  function clearConfirmTimer() {
    if (confirmTimer.current !== null) {
      window.clearTimeout(confirmTimer.current);
      confirmTimer.current = null;
    }
  }

  function resetConfirmation() {
    clearConfirmTimer();
    setConfirmCopy(false);
  }

  // Clear any pending confirmation timer when the component unmounts.
  useEffect(() => {
    return () => {
      if (confirmTimer.current !== null) {
        window.clearTimeout(confirmTimer.current);
      }
    };
  }, []);

  // Let Escape cancel a pending copy confirmation anywhere on the page.
  useEffect(() => {
    if (!confirmCopy) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (confirmTimer.current !== null) {
          window.clearTimeout(confirmTimer.current);
          confirmTimer.current = null;
        }
        setConfirmCopy(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmCopy]);

  async function handleCopy() {
    // While redaction is active, copying the real value requires an explicit
    // two-click confirmation: first click shows "Sure?", second click copies.
    // When redaction is off, a stale confirmation is cleared on the copy path.
    if (redacted && !confirmCopy) {
      setConfirmCopy(true);
      confirmTimer.current = window.setTimeout(() => {
        setConfirmCopy(false);
        confirmTimer.current = null;
      }, CONFIRM_RESET_MS);
      return;
    }

    resetConfirmation();
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
        {valueAriaLabel}
      </span>
      <span
        title={redacted ? undefined : value}
        aria-describedby={fullValueId}
        className="min-w-0 truncate"
      >
        {displayed}
      </span>
      <Button
        type="button"
        variant="ghost"
        onClick={handleCopy}
        className="min-h-8 shrink-0 rounded-md px-2 py-1 text-xs"
        aria-label={buttonAriaLabel}
        aria-describedby={fullValueId}
      >
        <Copy className="h-3.5 w-3.5" aria-hidden />
        {copied ? "Copied" : confirming ? "Sure?" : "Copy"}
      </Button>
    </span>
  );
}
