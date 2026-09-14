"use client";

import { useCallback, useState } from "react";
import { isErr } from "@/core/result/result";
import { inspectHorizonPagination } from "@/features/horizon-pagination-inspector/lib/horizonPaginationInspector";
import { parseHorizonPaginationInput } from "@/features/horizon-pagination-inspector/schema";
import type {
  HorizonPaginationInspectorErrorCode,
  HorizonPaginationReport,
  RawHorizonPaginationInput
} from "@/features/horizon-pagination-inspector/types";

export type HorizonPaginationInspectorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; report: HorizonPaginationReport }
  | { status: "error"; code: HorizonPaginationInspectorErrorCode };

/**
 * Manages the offline submission, validation, and state progression for the inspector.
 */
export function useHorizonPaginationInspector() {
  const [state, setState] = useState<HorizonPaginationInspectorState>({ status: "idle" });
  const [redactions, setRedactions] = useState(0);

  const submit = useCallback((raw: RawHorizonPaginationInput) => {
    setState({ status: "loading" });

    const parsed = parseHorizonPaginationInput(raw);
    if (isErr(parsed)) {
      if (parsed.code === "invalid_input") {
        setRedactions((count) => count + 1);
      }
      setState({ status: "error", code: parsed.code });
      return;
    }

    const inspection = inspectHorizonPagination(parsed.value);
    if (isErr(inspection)) {
      setState({ status: "error", code: inspection.code });
      return;
    }

    setState({ status: "success", report: inspection.value });
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset, redactions };
}
