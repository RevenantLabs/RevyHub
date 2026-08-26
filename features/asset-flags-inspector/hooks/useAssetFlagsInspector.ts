"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseAssetFlagsInspectorInput } from "@/features/asset-flags-inspector/schema";
import { runAssetFlagsInspector } from "@/features/asset-flags-inspector/lib/asset-flags";
import { toAssetFlagsInspectorErrorCode } from "@/features/asset-flags-inspector/lib/asset-flags.errors";
import type { AssetFlagsInspectorErrorCode, AssetFlagsInspectorResult } from "@/features/asset-flags-inspector/types";

export type AssetFlagsInspectorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AssetFlagsInspectorResult }
  | { status: "error"; code: AssetFlagsInspectorErrorCode };

export function useAssetFlagsInspector() {
  const { network } = useNetwork();
  const [state, setState] = useState<AssetFlagsInspectorState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseAssetFlagsInspectorInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<AssetFlagsInspectorResult, AssetFlagsInspectorErrorCode> = await runAssetFlagsInspector(
          parsed.value,
          network
        );
        if (next.signal.aborted) return;
        setState(
          result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code }
        );
      } catch (error) {
        if (next.signal.aborted) return;
        setState({ status: "error", code: toAssetFlagsInspectorErrorCode(error) });
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
