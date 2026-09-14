"use client";

import { useCallback, useState } from "react";
import { buildHorizonUrl } from "@/features/horizon-url-builder/lib/horizonUrlBuilder";
import type { BuiltHorizonUrl, HorizonUrlConfig, HorizonUrlErrorCode } from "@/features/horizon-url-builder/types";

export type HorizonUrlState =
  | { status: "idle" }
  | { status: "success"; result: BuiltHorizonUrl }
  | { status: "error"; code: HorizonUrlErrorCode };

export function useHorizonUrlBuilder() {
  const [state, setState] = useState<HorizonUrlState>({ status: "idle" });

  const build = useCallback((config: HorizonUrlConfig) => {
    const result = buildHorizonUrl(config);
    if (!result.ok) {
      setState({ status: "error", code: result.code });
    } else {
      setState({ status: "success", result: result.value });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, build, reset };
}
