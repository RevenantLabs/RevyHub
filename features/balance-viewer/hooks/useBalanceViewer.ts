"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseBalanceViewerInput } from "@/features/balance-viewer/schema";
import { loadAccountBalances } from "@/features/balance-viewer/lib/balanceViewer";
import type {
  AccountBalances,
  BalanceViewerErrorCode
} from "@/features/balance-viewer/types";

export type BalanceViewerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: AccountBalances }
  | { status: "error"; code: BalanceViewerErrorCode };

const IDLE: BalanceViewerState = { status: "idle" };

/** The state is stored next to the network it belongs to, never mixed into it. */
interface Held {
  state: BalanceViewerState;
  network: StellarNetwork;
}

export function useBalanceViewer() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);

  // The same address holds different balances on testnet and mainnet, so a
  // result from another network is derived away rather than reset in an effect.
  // That costs no extra render, leaves no stale frame, and also hides a
  // response that lands after the network was switched.
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: string) => {
      const parsed = parseBalanceViewerInput(raw);

      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      setHeld({ state: { status: "loading" }, network });

      const result = await loadAccountBalances(parsed.value, network);

      // Ignore a response that a newer request superseded.
      if (id !== requestId.current) return;

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
    requestId.current += 1;
    setHeld({ state: IDLE, network });
  }, [network]);

  return { state, submit, reset };
}
