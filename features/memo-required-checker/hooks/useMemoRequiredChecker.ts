"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { FIELD_OF_CODE, parseMemoRequiredCheckerInput } from "@/features/memo-required-checker/schema";
import { runMemoRequiredChecker } from "@/features/memo-required-checker/lib/memoRequiredChecker";
import type {
  MemoRequiredCheckerErrorCode,
  MemoRequiredCheckerResult,
  MemoRequiredField
} from "@/features/memo-required-checker/types";

export type MemoRequiredCheckerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: MemoRequiredCheckerResult }
  | { status: "error"; code: MemoRequiredCheckerErrorCode; field: MemoRequiredField | null };

const IDLE: MemoRequiredCheckerState = { status: "idle" };

interface Held {
  state: MemoRequiredCheckerState;
  network: StellarNetwork;
}

export function useMemoRequiredChecker() {
  const networkState = useNetwork();
  const { network } = networkState;
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: { accountId: string }) => {
      const parsed = parseMemoRequiredCheckerInput(raw);
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
      const result = await runMemoRequiredChecker(parsed.value, network);
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
