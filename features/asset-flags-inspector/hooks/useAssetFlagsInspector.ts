"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseAssetFlagsInspectorInput } from "@/features/asset-flags-inspector/schema";
import { runAssetFlagsInspector } from "@/features/asset-flags-inspector/lib/assetFlagsInspector";
import type {
  AssetFlagsInspectorErrorCode,
  AssetFlagsInspectorResult
} from "@/features/asset-flags-inspector/types";

export type AssetFlagsInspectorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AssetFlagsInspectorResult }
  | { status: "error"; code: AssetFlagsInspectorErrorCode };

const IDLE: AssetFlagsInspectorState = { status: "idle" };

interface Held {
  state: AssetFlagsInspectorState;
  network: StellarNetwork;
}

export function useAssetFlagsInspector() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);

  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: string) => {
      const parsed = parseAssetFlagsInspectorInput(raw);

      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      setHeld({ state: { status: "loading" }, network });

      const result = await runAssetFlagsInspector(parsed.value, network);
      if (id !== requestId.current) return;

      setHeld({
        state: result.ok
          ? { status: "success", result: result.value }
          : { status: "error", code: result.code },
        network
      });
    },
    [network]
  );

  const reset = useCallback(() => {
    requestId.current += 1;
    setHeld({ state: IDLE, network });
  }, [network]);

  return { state, submit, reset };
}
