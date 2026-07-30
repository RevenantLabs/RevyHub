"use client";

import { useCallback, useRef, useState } from "react";
import { copyText, type CopyResult } from "@/lib/copy";

interface UseCopyToClipboardOptions {
  resetAfter?: number;
}

interface UseCopyToClipboardReturn {
  copied: boolean;
  error: string | null;
  copy: (value: string) => Promise<CopyResult>;
}

export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}): UseCopyToClipboardReturn {
  const { resetAfter = 1600 } = options;
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (value: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const result = await copyText(value);

      if (result.success) {
        setCopied(true);
        setError(null);
        timeoutRef.current = setTimeout(() => setCopied(false), resetAfter);
      } else {
        setCopied(false);
        setError(result.error ?? null);
      }

      return result;
    },
    [resetAfter],
  );

  return { copied, error, copy };
}
