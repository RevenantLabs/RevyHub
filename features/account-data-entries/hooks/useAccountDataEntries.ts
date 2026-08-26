"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseAccountDataEntriesInput } from "@/features/account-data-entries/schema";
import { runAccountDataEntries } from "@/features/account-data-entries/lib/accountDataEntries";
import { toAccountDataEntriesErrorCode } from "@/features/account-data-entries/lib/accountDataEntries.errors";
import type { AccountDataEntriesErrorCode, AccountDataEntriesResult } from "@/features/account-data-entries/types";

export type AccountDataEntriesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AccountDataEntriesResult }
  | { status: "error"; code: AccountDataEntriesErrorCode };

export function useAccountDataEntries() {
  const { network } = useNetwork();
  const [state, setState] = useState<AccountDataEntriesState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseAccountDataEntriesInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<AccountDataEntriesResult, AccountDataEntriesErrorCode> = await runAccountDataEntries(
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
        setState({ status: "error", code: toAccountDataEntriesErrorCode(error) });
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
