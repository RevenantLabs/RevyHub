"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseTransactionInput } from "@/features/transaction-lookup/schema";
import { lookupTransaction } from "@/features/transaction-lookup/lib/transactionLookup";
import type {
  TransactionErrorCode,
  TransactionSummary
} from "@/features/transaction-lookup/types";

export type TransactionLookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; transaction: TransactionSummary }
  | { status: "error"; code: TransactionErrorCode };

const IDLE: TransactionLookupState = { status: "idle" };

interface Held {
  state: TransactionLookupState;
  network: StellarNetwork;
}

export function useTransactionLookup() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);

  // A hash that exists on testnet generally does not exist on mainnet, so a
  // result from another network is derived away instead of left on screen.
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: string) => {
      const parsed = parseTransactionInput(raw);

      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      setHeld({ state: { status: "loading" }, network });

      const result = await lookupTransaction(parsed.value, network);
      if (id !== requestId.current) return;

      setHeld({
        state: result.ok
          ? { status: "success", transaction: result.value }
          : { status: "error", code: result.code },
        network
      });
    },
    [network]
  );

  const reset = useCallback(() => {
    requestId.current += 1;
    setHeld({ state: IDLE, network });
  }, [network]);

  return { state, submit, reset };
}
