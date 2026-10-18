"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseReserveCalculatorInput } from "@/features/reserve-calculator/schema";
import { runReserveCalculator } from "@/features/reserve-calculator/lib/reserveCalculator";
import type { ReserveCalculatorErrorCode, ReserveCalculatorResult } from "@/features/reserve-calculator/types";

export type ReserveCalculatorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: ReserveCalculatorResult }
  | { status: "error"; code: ReserveCalculatorErrorCode };

const IDLE: ReserveCalculatorState = { status: "idle" };

interface Held {
  state: ReserveCalculatorState;
  network: StellarNetwork;
}

export function useReserveCalculator() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: string) => {
      const parsed = parseReserveCalculatorInput(raw);
      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      setHeld({ state: { status: "loading" }, network });

      const result = await runReserveCalculator(parsed.value, network);
      if (id !== requestId.current) return;

      setHeld({
        state: result.ok
          ? { status: "success", data: result.value }
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
