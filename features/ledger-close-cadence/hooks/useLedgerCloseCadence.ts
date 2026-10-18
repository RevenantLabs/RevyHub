"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { isErr, type Result } from "@/core/result/result";
import { parseLedgerCloseCadenceInput } from "@/features/ledger-close-cadence/schema";
import { runLedgerCloseCadence } from "@/features/ledger-close-cadence/lib/ledgerCloseCadence";
import { toLedgerCloseCadenceErrorCode } from "@/features/ledger-close-cadence/lib/ledgerCloseCadence.errors";
import type {
  LedgerCloseCadenceErrorCode,
  LedgerCloseCadenceResult,
  RawLedgerCloseCadenceForm
} from "@/features/ledger-close-cadence/types";

export type LedgerCloseCadenceState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: LedgerCloseCadenceResult }
  | { status: "error"; code: LedgerCloseCadenceErrorCode };

const IDLE: LedgerCloseCadenceState = { status: "idle" };

interface Held {
  state: LedgerCloseCadenceState;
  network: StellarNetwork;
}

export function useLedgerCloseCadence() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const controller = useRef<AbortController | null>(null);
  const requestId = useRef(0);

  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: RawLedgerCloseCadenceForm) => {
      controller.current?.abort();
      const parsed = parseLedgerCloseCadenceInput(raw);
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
        const result: Result<LedgerCloseCadenceResult, LedgerCloseCadenceErrorCode> =
          await runLedgerCloseCadence(parsed.value, network, next.signal);
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
          state: { status: "error", code: toLedgerCloseCadenceErrorCode(error) },
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
