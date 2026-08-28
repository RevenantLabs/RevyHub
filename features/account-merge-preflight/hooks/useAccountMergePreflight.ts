"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseAccountMergePreflightInput } from "@/features/account-merge-preflight/schema";
import { checkAccountMergePreflight } from "@/features/account-merge-preflight/lib/account-merge-preflight";
import { toAccountMergePreflightErrorCode } from "@/features/account-merge-preflight/lib/account-merge-preflight.errors";
import type { AccountMergePreflightErrorCode, AccountMergePreflightResult } from "@/features/account-merge-preflight/types";
import type { StellarNetwork } from "@/core/network/types";

export type AccountMergePreflightState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AccountMergePreflightResult; network: StellarNetwork }
  | { status: "error"; code: AccountMergePreflightErrorCode; network: StellarNetwork };

export function useAccountMergePreflight() {
  const { network } = useNetwork();
  const [state, setState] = useState<AccountMergePreflightState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (rawSource: string, rawDestination: string) => {
      controller.current?.abort();
      const parsed = parseAccountMergePreflightInput(rawSource, rawDestination);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code, network });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<AccountMergePreflightResult, AccountMergePreflightErrorCode> = await checkAccountMergePreflight(
          parsed.value,
          network
        );
        if (next.signal.aborted) return;
        setState(
          result.ok
            ? { status: "success", result: result.value, network }
            : { status: "error", code: result.code, network }
        );
      } catch (error) {
        if (next.signal.aborted) return;
        setState({ status: "error", code: toAccountMergePreflightErrorCode(error), network });
      }
    },
    [network]
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  // Compute staleness based on network mismatch
  const derivedState = state.status !== "idle" && state.status !== "loading" && state.network !== network
    ? { status: "idle" as const }
    : state;

  return { state: derivedState, submit, reset };
}
