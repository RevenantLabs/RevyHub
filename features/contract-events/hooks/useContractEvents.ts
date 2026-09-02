"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseContractEventsInput, type RawContractEventsInput } from "@/features/contract-events/schema";
import { runContractEvents } from "@/features/contract-events/lib/contractEvents";
import type {
  ContractEventsErrorCode,
  ContractEventsResult
} from "@/features/contract-events/types";

export type ContractEventsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: ContractEventsResult }
  | {
      status: "error";
      code: ContractEventsErrorCode;
      detail?: { latestLedger?: number; retentionStart?: number };
    };

const IDLE: ContractEventsState = { status: "idle" };

interface Held {
  state: ContractEventsState;
  network: StellarNetwork;
}

export function useContractEvents() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);

  // A result from testnet is not meaningful when the user switches to mainnet.
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: RawContractEventsInput) => {
      const parsed = parseContractEventsInput(raw);

      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      setHeld({ state: { status: "loading" }, network });

      const result: Result<
        ContractEventsResult,
        ContractEventsErrorCode,
        { latestLedger?: number; retentionStart?: number }
      > = await runContractEvents(parsed.value, network);

      if (id !== requestId.current) return;

      setHeld({
        state: result.ok
          ? { status: "success", result: result.value }
          : { status: "error", code: result.code, detail: result.detail },
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
