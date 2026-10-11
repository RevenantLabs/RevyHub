"use client";

import { useCallback, useState } from "react";
import { parseHorizonResponse } from "@/features/horizon-pagination-inspector/lib/horizonPagination";
import type { HorizonPageInfo, HorizonPaginationErrorCode } from "@/features/horizon-pagination-inspector/types";

export type HorizonPaginationState =
  | { status: "idle" }
  | { status: "success"; result: HorizonPageInfo }
  | { status: "error"; code: HorizonPaginationErrorCode };

export function useHorizonPaginationInspector() {
  const [state, setState] = useState<HorizonPaginationState>({ status: "idle" });

  const inspect = useCallback((raw: string) => {
    const result = parseHorizonResponse(raw);
    if (!result.ok) {
      setState({ status: "error", code: result.code });
    } else {
      setState({ status: "success", result: result.value });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, inspect, reset };
}
