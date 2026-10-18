"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { isErr, type Result } from "@/core/result/result";
import { parseLedgerProtocolTransitionMapInput } from "@/features/ledger-protocol-transition-map/schema";
import { runLedgerProtocolTransitionMap } from "@/features/ledger-protocol-transition-map/lib/ledgerProtocolTransitionMap";
import { toLedgerProtocolTransitionMapErrorCode } from "@/features/ledger-protocol-transition-map/lib/ledgerProtocolTransitionMap.errors";
import type {
  LedgerProtocolTransitionMapErrorCode,
  LedgerProtocolTransitionMapResult,
  RawLedgerProtocolTransitionMapForm
} from "@/features/ledger-protocol-transition-map/types";

export type LedgerProtocolTransitionMapState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: LedgerProtocolTransitionMapResult }
  | { status: "error"; code: LedgerProtocolTransitionMapErrorCode };

const IDLE: LedgerProtocolTransitionMapState = { status: "idle" };

interface Held {
  state: LedgerProtocolTransitionMapState;
  network: StellarNetwork;
}

export function useLedgerProtocolTransitionMap() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const controller = useRef<AbortController | null>(null);
  const requestId = useRef(0);

  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: RawLedgerProtocolTransitionMapForm) => {
      controller.current?.abort();
      const parsed = parseLedgerProtocolTransitionMapInput(raw);
      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      const next = new AbortController();
      controller.current = next;
      setHeld({ state: { status: "loading" }, network });

      try {
        const result: Result<
          LedgerProtocolTransitionMapResult,
          LedgerProtocolTransitionMapErrorCode
        > = await runLedgerProtocolTransitionMap(parsed.value, network, next.signal);
        if (id !== requestId.current || next.signal.aborted) return;
        setHeld({
          state: result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code },
          network
        });
      } catch (error) {
        if (id !== requestId.current || next.signal.aborted) return;
        setHeld({
          state: { status: "error", code: toLedgerProtocolTransitionMapErrorCode(error) },
          network
        });
      }
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
