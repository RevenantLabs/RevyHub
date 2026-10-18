"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { parseLedgerLookupInput } from "../schema";
import { runLedgerLookup } from "../lib/ledgerLookup";
import type { LedgerLookupResult, LedgerLookupErrorCode } from "../types";
export type LedgerLookupState = { status: "idle" } | {status: "loading"} | {status: "success"; result: LedgerLookupResult} | {status: "error"; code: LedgerLookupErrorCode; currentHeight?: number};
export function useLedgerLookup() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<{network: StellarNetwork; state: LedgerLookupState}>({network, state: {status: "idle"}});
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const submit = useCallback(async (raw: string) => {
    controller.current?.abort();
    const parsed = parseLedgerLookupInput(raw);
    if (!parsed.ok) { setHeld({network, state: {status: "error", code: parsed.code}}); return; }
    const next = new AbortController(); controller.current = next;
    setHeld({network, state: {status: "loading"}});
    const result = await runLedgerLookup(parsed.value, network, next.signal);
    if (next.signal.aborted) return;
    setHeld({network, state: result.ok ? {status: "success", result: result.value} : {status: "error", code: result.code, currentHeight: !result.ok && typeof result.detail === "object" && result.detail !== null && "currentHeight" in result.detail ? Number(result.detail.currentHeight) : undefined}});
  }, [network]);
  const reset = useCallback(() => { controller.current?.abort(); setHeld({network, state: {status: "idle"}}); }, [network]);
  return {state: held.network === network ? held.state : {status: "idle"} as LedgerLookupState, submit, reset};
}
