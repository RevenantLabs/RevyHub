"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseSep10InspectorInput } from "@/features/sep10-inspector/schema";
import { runSep10Inspector } from "@/features/sep10-inspector/lib/sep10Inspector";
import { toSep10InspectorErrorCode } from "@/features/sep10-inspector/lib/sep10Inspector.errors";
import type { Sep10InspectorErrorCode, Sep10InspectorResult } from "@/features/sep10-inspector/types";

export type Sep10InspectorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: Sep10InspectorResult }
  | { status: "error"; code: Sep10InspectorErrorCode };

export function useSep10Inspector() {
  const { network } = useNetwork();
  const [state, setState] = useState<Sep10InspectorState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseSep10InspectorInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<Sep10InspectorResult, Sep10InspectorErrorCode> = await runSep10Inspector(
          parsed.value,
          network,
          next.signal
        );
        if (next.signal.aborted) return;
        setState(
          result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code }
        );
      } catch (error) {
        if (next.signal.aborted) return;
        setState({ status: "error", code: toSep10InspectorErrorCode(error) });
      }
    },
    [network]
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
