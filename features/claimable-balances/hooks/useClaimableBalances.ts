"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import {
  FIELD_OF_CODE,
  parseClaimableBalancesInput,
  type RawClaimableBalancesInput
} from "@/features/claimable-balances/schema";
import { runClaimableBalances } from "@/features/claimable-balances/lib/claimableBalances";
import type {
  ClaimableBalancesErrorCode,
  ClaimableBalancesField,
  ClaimableBalancesResult
} from "@/features/claimable-balances/types";

export type ClaimableBalancesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: ClaimableBalancesResult }
  | { status: "error"; code: ClaimableBalancesErrorCode; field: ClaimableBalancesField | null };

const IDLE: ClaimableBalancesState = { status: "idle" };

interface Held {
  state: ClaimableBalancesState;
  network: StellarNetwork;
}

export function useClaimableBalances() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const controller = useRef<AbortController | null>(null);

  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: RawClaimableBalancesInput) => {
      controller.current?.abort();
      const parsed = parseClaimableBalancesInput(raw);

      if (isErr(parsed)) {
        setHeld({
          state: {
            status: "error",
            code: parsed.code,
            field:
              parsed.code === "empty_input" || parsed.code === "invalid_input"
                ? raw.mode === "account"
                  ? "accountId"
                  : "balanceId"
                : FIELD_OF_CODE[parsed.code]
          },
          network
        });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setHeld({ state: { status: "loading" }, network });

      const result = await runClaimableBalances(parsed.value, network, next.signal);
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
