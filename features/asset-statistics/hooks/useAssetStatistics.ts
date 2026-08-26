"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseAssetStatisticsInput } from "@/features/asset-statistics/schema";
import { runAssetStatistics } from "@/features/asset-statistics/lib/assetStatistics";
import { toAssetStatisticsErrorCode } from "@/features/asset-statistics/lib/assetStatistics.errors";
import type { AssetStatisticsErrorCode, AssetStatisticsResult } from "@/features/asset-statistics/types";

export type AssetStatisticsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AssetStatisticsResult }
  | { status: "error"; code: AssetStatisticsErrorCode };

export function useAssetStatistics() {
  const { network } = useNetwork();
  const [state, setState] = useState<AssetStatisticsState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseAssetStatisticsInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<AssetStatisticsResult, AssetStatisticsErrorCode> = await runAssetStatistics(
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
        setState({ status: "error", code: toAssetStatisticsErrorCode(error) });
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
