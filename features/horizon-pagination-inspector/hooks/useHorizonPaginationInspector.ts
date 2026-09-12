"use client";

import { useCallback, useState } from "react";
import { isErr } from "@/core/result/result";
import { parseHorizonPaginationInspectorInput } from "@/features/horizon-pagination-inspector/schema";
import { inspectPagination } from "@/features/horizon-pagination-inspector/lib/horizonPaginationInspector";
import type {
  PaginationErrorCode,
  PaginationInspection
} from "@/features/horizon-pagination-inspector/types";

export type HorizonPaginationInspectorState =
  | { status: "idle" }
  | { status: "success"; inspection: PaginationInspection }
  | { status: "error"; code: PaginationErrorCode };

/**
 * Reading is synchronous and local, so there is no loading state: adding one
 * would only put a fake delay in front of two pure functions. The absence of a
 * loading state is therefore a property of the tool, not a missing state.
 */
export function useHorizonPaginationInspector() {
  const [state, setState] = useState<HorizonPaginationInspectorState>({ status: "idle" });

  const submit = useCallback((raw: string) => {
    const parsed = parseHorizonPaginationInspectorInput(raw);

    if (isErr(parsed)) {
      setState({ status: "error", code: parsed.code });
      return;
    }

    const result = inspectPagination(parsed.value);

    setState(
      result.ok
        ? { status: "success", inspection: result.value }
        : { status: "error", code: result.code }
    );
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}
