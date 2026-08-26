"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseAccountMergePreflightInput } from "@/features/account-merge-preflight/schema";
import { runAccountMergePreflight } from "@/features/account-merge-preflight/lib/accountMergePreflight";
import { toAccountMergePreflightErrorCode } from "@/features/account-merge-preflight/lib/accountMergePreflight.errors";
import type { AccountMergePreflightErrorCode, AccountMergePreflightResult } from "@/features/account-merge-preflight/types";

export type AccountMergePreflightState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AccountMergePreflightResult }
  | { status: "error"; code: AccountMergePreflightErrorCode };

export function useAccountMergePreflight() {
  const { network } = useNetwork();
  const [state, setState] = useState<AccountMergePreflightState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseAccountMergePreflightInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<AccountMergePreflightResult, AccountMergePreflightErrorCode> = await runAccountMergePreflight(
          parsed.value,
          network,
          next.signal
        );
        if (next.signal.aborted) return;
        setState(
          result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code }
        );
      } catch (error) {
        if (next.signal.aborted) return;
        setState({ status: "error", code: toAccountMergePreflightErrorCode(error) });
      }
    },
    [network]
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
