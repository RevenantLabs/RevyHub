"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseContractStorageInput } from "@/features/contract-storage/schema";
import { runContractStorage } from "@/features/contract-storage/lib/contractStorage";
import { toContractStorageErrorCode } from "@/features/contract-storage/lib/contractStorage.errors";
import type {
  ContractStorageErrorCode,
  ContractStorageResult
} from "@/features/contract-storage/types";

export type ContractStorageState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: ContractStorageResult }
  | { status: "error"; code: ContractStorageErrorCode };

const IDLE: ContractStorageState = { status: "idle" };

interface Held {
  state: ContractStorageState;
  network: StellarNetwork;
}

export function useContractStorage() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);

  // A result from testnet is not meaningful when the user switches to mainnet.
  // Derive the stale result away instead of resetting it in an effect.
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: string) => {
      const parsed = parseContractStorageInput(raw);
      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      setHeld({ state: { status: "loading" }, network });

      try {
        const result: Result<ContractStorageResult, ContractStorageErrorCode> =
          await runContractStorage(parsed.value, network);

        if (id !== requestId.current) return;

        setHeld({
          state: result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code },
          network
        });
      } catch (error) {
        if (id !== requestId.current) return;
        setHeld({ state: { status: "error", code: toContractStorageErrorCode(error) }, network });
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
