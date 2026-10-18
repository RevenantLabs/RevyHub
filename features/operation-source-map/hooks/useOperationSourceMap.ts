"use client";

import { useCallback, useMemo, useState } from "react";
import { isErr } from "@/core/result/result";
import { parseSourceMapInput } from "@/features/operation-source-map/schema";
import { buildSourceMap } from "@/features/operation-source-map/lib/operationSourceMap";
import { filterOperations } from "@/features/operation-source-map/lib/format";
import type {
  SourceFilter,
  SourceMap,
  SourceMapErrorCode
} from "@/features/operation-source-map/types";

export type OperationSourceMapState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; map: SourceMap }
  | { status: "error"; code: SourceMapErrorCode };

/**
 * Mapping is synchronous and local. The loading state exists because the
 * contract requires all four, and it is entered and left within the same
 * update so no artificial delay is ever shown.
 */
export function useOperationSourceMap() {
  const [state, setState] = useState<OperationSourceMapState>({ status: "idle" });
  const [filter, setFilter] = useState<SourceFilter>("all");

  /**
   * Increments every time a pasted secret key is refused.
   *
   * The panel keys the form on this counter, so a rejected seed is wiped from
   * the textarea instead of sitting there in plain text.
   */
  const [redactions, setRedactions] = useState(0);

  const submit = useCallback((raw: string) => {
    setState({ status: "loading" });

    const parsed = parseSourceMapInput(raw);

    if (isErr(parsed)) {
      if (parsed.detail === "secret_key") setRedactions((count) => count + 1);
      setState({ status: "error", code: parsed.code });
      return;
    }

    const result = buildSourceMap(parsed.value);

    // A new envelope gets a clean view. Carrying a filter across a submission
    // would show an empty table for a map that is not empty at all.
    setFilter("all");
    setState(
      result.ok ? { status: "success", map: result.value } : { status: "error", code: result.code }
    );
  }, []);

  /**
   * Derived during render rather than stored beside the map, so the visible
   * rows can never drift out of sync with the map they came from.
   */
  const visibleOperations = useMemo(
    () => (state.status === "success" ? filterOperations(state.map.operations, filter) : []),
    [state, filter]
  );

  const resetFilter = useCallback(() => setFilter("all"), []);
  const reset = useCallback(() => {
    setFilter("all");
    setState({ status: "idle" });
  }, []);

  return { state, filter, setFilter, visibleOperations, resetFilter, submit, reset, redactions };
}
