"use client";

import { useCallback, useState } from "react";
import { isErr } from "@/core/result/result";
import { parseResultCodeExplainerInput } from "@/features/result-code-explainer/schema";
import { explainResultCodes } from "@/features/result-code-explainer/lib/resultCodeExplainer";
import type {
  ResultCodeExplainerErrorCode,
  ResultCodeExplainerMode,
  ResultCodeExplainerResult
} from "@/features/result-code-explainer/types";

export type ResultCodeExplainerState =
  | { status: "idle" }
  | { status: "success"; result: ResultCodeExplainerResult }
  | { status: "error"; code: ResultCodeExplainerErrorCode };

/**
 * Lookup and XDR decoding are synchronous and local, so there is no loading
 * state — adding one would only put a fake delay in front of a pure function.
 */
export function useResultCodeExplainer() {
  const [state, setState] = useState<ResultCodeExplainerState>({ status: "idle" });

  const submit = useCallback(
    (raw: { mode: ResultCodeExplainerMode; value: string; search?: string }) => {
      const parsed = parseResultCodeExplainerInput(raw);

      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const result = explainResultCodes(parsed.value);
      setState(
        result.ok
          ? { status: "success", result: result.value }
          : { status: "error", code: result.code }
      );
    },
    []
  );

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}
