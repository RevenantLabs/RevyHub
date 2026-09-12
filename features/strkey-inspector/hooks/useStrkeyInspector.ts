"use client";

import { useCallback, useRef, useState } from "react";
import { isErr, type Result } from "@/core/result/result";
import { parseStrkeyInspectorInput } from "@/features/strkey-inspector/schema";
import { runStrkeyInspector } from "@/features/strkey-inspector/lib/strkeyInspector";
import { toStrkeyInspectorErrorCode } from "@/features/strkey-inspector/lib/strkeyInspector.errors";
import type {
  StrkeyInspectorErrorCode,
  StrkeyInspectorResult
} from "@/features/strkey-inspector/types";

export type StrkeyInspectorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: StrkeyInspectorResult }
  | { status: "error"; code: StrkeyInspectorErrorCode };

/**
 * State machine managing input submission, validation, loading, and inspection results.
 */
export function useStrkeyInspector() {
  const [state, setState] = useState<StrkeyInspectorState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(async (raw: string) => {
    controller.current?.abort();
    const parsed = parseStrkeyInspectorInput(raw);
    if (isErr(parsed)) {
      setState({ status: "error", code: parsed.code });
      return;
    }

    const next = new AbortController();
    controller.current = next;
    setState({ status: "loading" });

    try {
      const result: Result<StrkeyInspectorResult, StrkeyInspectorErrorCode> =
        await runStrkeyInspector(parsed.value);
      if (next.signal.aborted) return;
      setState(
        result.ok
          ? { status: "success", result: result.value }
          : { status: "error", code: result.code }
      );
    } catch (error) {
      if (next.signal.aborted) return;
      setState({ status: "error", code: toStrkeyInspectorErrorCode(error) });
    }
  }, []);

  const reset = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
