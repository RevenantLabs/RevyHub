"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseTransactionFeeChargeAuditInput } from "@/features/transaction-fee-charge-audit/schema";
import { runTransactionFeeChargeAudit } from "@/features/transaction-fee-charge-audit/lib/transactionFeeChargeAudit";
import type {
  TransactionFeeChargeAuditErrorCode,
  TransactionFeeChargeAuditResult
} from "@/features/transaction-fee-charge-audit/types";

export type TransactionFeeChargeAuditState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: TransactionFeeChargeAuditResult }
  | { status: "error"; code: TransactionFeeChargeAuditErrorCode };

const IDLE: TransactionFeeChargeAuditState = { status: "idle" };

interface Held {
  state: TransactionFeeChargeAuditState;
  network: StellarNetwork;
}

export function useTransactionFeeChargeAudit() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);

  // A hash that exists on testnet generally does not exist on mainnet, so a
  // result from another network is derived away instead of left on screen.
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: string) => {
      const parsed = parseTransactionFeeChargeAuditInput(raw);

      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      setHeld({ state: { status: "loading" }, network });

      const result = await runTransactionFeeChargeAudit(parsed.value, network);
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
