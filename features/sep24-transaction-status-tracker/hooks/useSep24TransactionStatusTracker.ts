"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { FIELD_OF_CODE, parseSep24TransactionStatusTrackerInput } from "@/features/sep24-transaction-status-tracker/schema";
import { runSep24TransactionStatusTracker } from "@/features/sep24-transaction-status-tracker/lib/sep24TransactionStatusTracker";
import type {
  Sep24Field,
  Sep24TransactionStatusTrackerErrorCode,
  Sep24TransactionStatusTrackerResult
} from "@/features/sep24-transaction-status-tracker/types";

export type Sep24TransactionStatusTrackerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: Sep24TransactionStatusTrackerResult }
  | { status: "error"; code: Sep24TransactionStatusTrackerErrorCode; field: Sep24Field | null };

const IDLE: Sep24TransactionStatusTrackerState = { status: "idle" };

interface Held {
  state: Sep24TransactionStatusTrackerState;
  network: StellarNetwork;
}

export function useSep24TransactionStatusTracker() {
  const networkState = useNetwork();
  const { network } = networkState;
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: { homeDomain: string; transactionId: string; token: string }) => {
      const parsed = parseSep24TransactionStatusTrackerInput(raw);
      if (isErr(parsed)) {
        setHeld({
          state: { status: "error", code: parsed.code, field: FIELD_OF_CODE[parsed.code] },
          network
        });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      setHeld({ state: { status: "loading" }, network });
      const result = await runSep24TransactionStatusTracker(parsed.value);
      if (id !== requestId.current) return;
      setHeld({
        state: result.ok
          ? { status: "success", result: result.value }
          : { status: "error", code: result.code, field: FIELD_OF_CODE[result.code] },
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
