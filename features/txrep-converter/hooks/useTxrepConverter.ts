"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseTxrepConverterInput } from "@/features/txrep-converter/schema";
import { runTxrepConverter } from "@/features/txrep-converter/lib/txrepConverter";
import type { TxrepConverterErrorCode, TxrepConverterResult } from "@/features/txrep-converter/types";

export type TxrepConverterState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: TxrepConverterResult }
  | { status: "error"; code: TxrepConverterErrorCode };

const IDLE: TxrepConverterState = { status: "idle" };

interface Held {
  state: TxrepConverterState;
  network: StellarNetwork;
}

export function useTxrepConverter() {
  const networkState = useNetwork();
  const { network } = networkState;
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    (raw: string) => {
      const parsed = parseTxrepConverterInput(raw);
      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      setHeld({ state: { status: "loading" }, network });
      const result = runTxrepConverter(parsed.value);
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

  return { state, submit, reset, network: networkState };
}
