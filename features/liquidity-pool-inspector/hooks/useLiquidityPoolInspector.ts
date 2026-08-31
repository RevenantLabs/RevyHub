"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseLiquidityPoolInspectorInput } from "@/features/liquidity-pool-inspector/schema";
import { runLiquidityPoolInspector } from "@/features/liquidity-pool-inspector/lib/liquidityPoolInspector";
import type {
  LiquidityPoolInspectorErrorCode,
  LiquidityPoolInspectorResult
} from "@/features/liquidity-pool-inspector/types";

export type LiquidityPoolInspectorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: LiquidityPoolInspectorResult }
  | { status: "error"; code: LiquidityPoolInspectorErrorCode };

const IDLE: LiquidityPoolInspectorState = { status: "idle" };

interface Held {
  state: LiquidityPoolInspectorState;
  network: StellarNetwork;
}

export function useLiquidityPoolInspector() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);

  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: string) => {
      const parsed = parseLiquidityPoolInspectorInput(raw);

      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      setHeld({ state: { status: "loading" }, network });

      const result = await runLiquidityPoolInspector(parsed.value, network);
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
