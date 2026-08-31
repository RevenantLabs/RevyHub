"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseAnchorDiscoveryInput } from "@/features/anchor-discovery/schema";
import { runAnchorDiscovery } from "@/features/anchor-discovery/lib/anchorDiscovery";
import { toAnchorDiscoveryErrorCode } from "@/features/anchor-discovery/lib/anchorDiscovery.errors";
import type { AnchorDiscoveryErrorCode, AnchorDiscoveryResult } from "@/features/anchor-discovery/types";

export type AnchorDiscoveryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AnchorDiscoveryResult }
  | { status: "error"; code: AnchorDiscoveryErrorCode };

export function useAnchorDiscovery() {
  const { network } = useNetwork();
  const [state, setState] = useState<AnchorDiscoveryState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseAnchorDiscoveryInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<AnchorDiscoveryResult, AnchorDiscoveryErrorCode> = await runAnchorDiscovery(
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
        setState({ status: "error", code: toAnchorDiscoveryErrorCode(error) });
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
