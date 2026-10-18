"use client";
import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { parseMuxedPaymentRoutingAuditInput } from "@/features/muxed-payment-routing-audit/schema";
import { runMuxedPaymentRoutingAudit } from "@/features/muxed-payment-routing-audit/lib/muxedPaymentRoutingAudit";
import type { MuxedPaymentRoutingAuditState } from "@/features/muxed-payment-routing-audit/types";
const IDLE: MuxedPaymentRoutingAuditState = { status: "idle" };
export function useMuxedPaymentRoutingAudit() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<{ network: StellarNetwork; state: MuxedPaymentRoutingAuditState }>({ network, state: IDLE });
  const controller = useRef<AbortController | null>(null);
  const state = held.network === network ? held.state : IDLE;
  const submit = useCallback(async (raw: string) => {
    controller.current?.abort();
    const parsed = parseMuxedPaymentRoutingAuditInput(raw);
    if (!parsed.ok) { setHeld({ network, state: { status: "error", code: parsed.code } }); return; }
    const next = new AbortController();
    controller.current = next;
    setHeld({ network, state: { status: "loading" } });
    const result = await runMuxedPaymentRoutingAudit(parsed.value, network, next.signal);
    if (next.signal.aborted) return;
    setHeld({ network, state: result.ok ? { status: "success", result: result.value } : { status: "error", code: result.code } });
  }, [network]);
  const reset = useCallback(() => { controller.current?.abort(); setHeld({ network, state: IDLE }); }, [network]);
  return { state, submit, reset };
}
