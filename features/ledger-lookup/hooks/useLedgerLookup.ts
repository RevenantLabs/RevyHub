"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseLedgerLookupInput } from "@/features/ledger-lookup/schema";
import { runLedgerLookup } from "@/features/ledger-lookup/lib/ledgerLookup";
import { toLedgerLookupErrorCode } from "@/features/ledger-lookup/lib/ledgerLookup.errors";
import type { LedgerLookupState } from "@/features/ledger-lookup/types";

const IDLE: LedgerLookupState = { status: "idle" };

interface Held {
  state: LedgerLookupState;
  network: StellarNetwork;
}

/** React hook managing ledger lookup execution, abort lifecycle and network transitions. */
export function useLedgerLookup() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);

  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: string) => {
      const parsed = parseLedgerLookupInput(raw);
      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      setHeld({ state: { status: "loading" }, network });

      try {
        const result = await runLedgerLookup(parsed.value, network);
        if (id !== requestId.current) return;

        setHeld({
          state: result.ok
            ? { status: "success", ledger: result.value }
            : { status: "error", code: result.code, detail: result.detail },
          network
        });
      } catch (error) {
        if (id !== requestId.current) return;
        setHeld({
          state: { status: "error", code: toLedgerLookupErrorCode(error) },
          network
        });
      }
    },
    [network]
  );

  const reset = useCallback(() => {
    requestId.current += 1;
    setHeld({ state: IDLE, network });
  }, [network]);

  return { state, submit, reset };
}
