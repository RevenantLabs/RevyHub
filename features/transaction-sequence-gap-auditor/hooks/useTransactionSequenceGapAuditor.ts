"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { isErr, type Result } from "@/core/result/result";
import { parseAuditorInput } from "@/features/transaction-sequence-gap-auditor/schema";
import { runTransactionSequenceGapAuditor } from "@/features/transaction-sequence-gap-auditor/lib/transactionSequenceGapAuditor";
import { toTransactionSequenceGapAuditorErrorCode } from "@/features/transaction-sequence-gap-auditor/lib/transactionSequenceGapAuditor.errors";
import type { AuditorResult, ErrorCode, RawAuditorForm } from "@/features/transaction-sequence-gap-auditor/types";

export type TransactionSequenceGapAuditorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AuditorResult }
  | { status: "error"; code: ErrorCode };

const IDLE: TransactionSequenceGapAuditorState = { status: "idle" };

interface HeldState {
  state: TransactionSequenceGapAuditorState;
  network: StellarNetwork;
}

export function useTransactionSequenceGapAuditor() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<HeldState>({ state: IDLE, network });
  const controller = useRef<AbortController | null>(null);
  const requestId = useRef(0);
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: RawAuditorForm) => {
      controller.current?.abort();
      const parsed = parseAuditorInput(raw);
      if (isErr(parsed)) {
        requestId.current += 1;
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      const next = new AbortController();
      controller.current = next;
      setHeld({ state: { status: "loading" }, network });

      try {
        const result: Result<AuditorResult, ErrorCode> = await runTransactionSequenceGapAuditor(
          parsed.value,
          network,
          next.signal
        );
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
          state: { status: "error", code: toTransactionSequenceGapAuditorErrorCode(error) },
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
