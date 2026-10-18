"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseAccountDataEntriesInput } from "@/features/account-data-entries/schema";
import { loadAccountDataEntries } from "@/features/account-data-entries/lib/accountDataEntries";
import type { AccountDataEntries, AccountDataEntriesErrorCode } from "@/features/account-data-entries/types";

export type AccountDataEntriesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: AccountDataEntries }
  | { status: "error"; code: AccountDataEntriesErrorCode };

const IDLE: AccountDataEntriesState = { status: "idle" };

interface Held {
  state: AccountDataEntriesState;
  network: StellarNetwork;
}

export function useAccountDataEntries() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseAccountDataEntriesInput(raw);
      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      const next = new AbortController();
      controller.current = next;
      setHeld({ state: { status: "loading" }, network });

      const result = await loadAccountDataEntries(parsed.value, network, next.signal);
      if (id !== requestId.current || next.signal.aborted) return;

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
    controller.current?.abort();
    requestId.current += 1;
    setHeld({ state: IDLE, network });
  }, [network]);

  return { state, submit, reset };
}
