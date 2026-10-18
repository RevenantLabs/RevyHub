"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parsePaymentReceiptReconcilerInput } from "@/features/payment-receipt-reconciler/schema";
import { runPaymentReceiptReconciler } from "@/features/payment-receipt-reconciler/lib/paymentReceiptReconciler";
import type {
  PaymentReceipt,
  PaymentReceiptReconcilerErrorCode
} from "@/features/payment-receipt-reconciler/types";

export type PaymentReceiptReconcilerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: PaymentReceipt }
  | { status: "error"; code: PaymentReceiptReconcilerErrorCode };

const IDLE: PaymentReceiptReconcilerState = { status: "idle" };

interface Held {
  state: PaymentReceiptReconcilerState;
  network: StellarNetwork;
}

export function usePaymentReceiptReconciler() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);

  // A hash that exists on testnet generally does not exist on mainnet, so a
  // result from another network is derived away instead of left on screen.
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parsePaymentReceiptReconcilerInput(raw);

      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      const next = new AbortController();
      controller.current = next;
      setHeld({ state: { status: "loading" }, network });

      const result = await runPaymentReceiptReconciler(parsed.value, network, next.signal);
      if (id !== requestId.current || next.signal.aborted) return;

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
    controller.current?.abort();
    requestId.current += 1;
    setHeld({ state: IDLE, network });
  }, [network]);

  return { state, submit, reset };
}
