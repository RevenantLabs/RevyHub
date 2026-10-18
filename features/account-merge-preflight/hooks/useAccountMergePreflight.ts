"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { isErr } from "@/core/result/result";
import {
  FIELD_OF_CODE,
  parseAccountMergePreflightInput,
  type RawAccountMergePreflightInput
} from "@/features/account-merge-preflight/schema";
import { checkAccountMergePreflight } from "@/features/account-merge-preflight/lib/accountMergePreflight";
import type {
  AccountMergeField,
  AccountMergePreflightErrorCode,
  AccountMergePreflightResult
} from "@/features/account-merge-preflight/types";

export type AccountMergePreflightState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AccountMergePreflightResult }
  | { status: "error"; code: AccountMergePreflightErrorCode; field: AccountMergeField | null };

const IDLE: AccountMergePreflightState = { status: "idle" };

interface HeldState {
  state: AccountMergePreflightState;
  network: StellarNetwork;
}

export function useAccountMergePreflight() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<HeldState>({ state: IDLE, network });
  const controller = useRef<AbortController | null>(null);
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: RawAccountMergePreflightInput) => {
      controller.current?.abort();
      const parsed = parseAccountMergePreflightInput(raw);
      if (isErr(parsed)) {
        setHeld({
          state: { status: "error", code: parsed.code, field: FIELD_OF_CODE[parsed.code] },
          network
        });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setHeld({ state: { status: "loading" }, network });

      const result = await checkAccountMergePreflight(parsed.value, network, next.signal);
      if (next.signal.aborted) return;
      setHeld({
        state: result.ok
          ? { status: "success", result: result.value }
          : {
              status: "error",
              code: result.code,
              field: FIELD_OF_CODE[result.code]
            },
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
