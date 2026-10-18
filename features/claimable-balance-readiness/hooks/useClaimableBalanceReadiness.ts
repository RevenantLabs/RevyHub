"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import {
  FIELD_OF_CODE,
  parseClaimableBalanceReadinessInput,
  type RawClaimableBalanceReadinessInput
} from "@/features/claimable-balance-readiness/schema";
import { runClaimableBalanceReadiness } from "@/features/claimable-balance-readiness/lib/claimableBalanceReadiness";
import type {
  ClaimableBalanceReadinessErrorCode,
  ClaimableBalanceReadinessField,
  ClaimableBalanceReadinessResult
} from "@/features/claimable-balance-readiness/types";

export type ClaimableBalanceReadinessState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: ClaimableBalanceReadinessResult }
  | {
      status: "error";
      code: ClaimableBalanceReadinessErrorCode;
      field: ClaimableBalanceReadinessField | null;
    };

const IDLE: ClaimableBalanceReadinessState = { status: "idle" };

interface Held {
  state: ClaimableBalanceReadinessState;
  network: StellarNetwork;
}

export function useClaimableBalanceReadiness() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const controller = useRef<AbortController | null>(null);

  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: RawClaimableBalanceReadinessInput) => {
      controller.current?.abort();
      const parsed = parseClaimableBalanceReadinessInput(raw);

      if (isErr(parsed)) {
        setHeld({
          state: {
            status: "error",
            code: parsed.code,
            field: FIELD_OF_CODE[parsed.code]
          },
          network
        });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setHeld({ state: { status: "loading" }, network });

      const result = await runClaimableBalanceReadiness(parsed.value, network, next.signal);
      if (next.signal.aborted) return;

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
    controller.current?.abort();
    setHeld({ state: IDLE, network });
  }, [network]);

  return { state, submit, reset };
}
