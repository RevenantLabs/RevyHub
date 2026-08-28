"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseAccountSignersInput } from "@/features/account-signers/schema";
import { loadAccountSigners } from "@/features/account-signers/lib/accountSigners";
import type {
  AccountSignersErrorCode,
  AccountSignersResult
} from "@/features/account-signers/types";

export type AccountSignersState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AccountSignersResult }
  | { status: "error"; code: AccountSignersErrorCode };

const IDLE: AccountSignersState = { status: "idle" };

interface Held {
  state: AccountSignersState;
  network: StellarNetwork;
}

export function useAccountSigners() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);

  // Signers and thresholds are network-specific. Deriving stale state away
  // avoids showing even one frame of a result from the previous network.
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: string) => {
      const parsed = parseAccountSignersInput(raw);

      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      setHeld({ state: { status: "loading" }, network });

      const result = await loadAccountSigners(parsed.value, network);
      if (id !== requestId.current) return;

      setHeld({
        state: result.ok
          ? { status: "success", result: result.value }
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
