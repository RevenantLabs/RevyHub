"use client";
import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { parseOperationResultXdrDecoderInput } from "../schema";
import { runOperationResultXdrDecoder } from "../lib/operationResultXdrDecoder";
import type { OperationResultXdrDecoderErrorCode, OperationResultXdrDecoderResult } from "../types";

export type OperationResultXdrDecoderState = { status: "idle" } | { status: "loading" } | { status: "success"; result: OperationResultXdrDecoderResult } | { status: "error"; code: OperationResultXdrDecoderErrorCode };
const idle: OperationResultXdrDecoderState = { status: "idle" };
export function useOperationResultXdrDecoder() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<{ network: StellarNetwork; state: OperationResultXdrDecoderState }>({ network, state: idle });
  const requestId = useRef(0);
  const state = held.network === network ? held.state : idle;
  const submit = useCallback(async (raw: string) => {
    const id = ++requestId.current;
    const parsed = parseOperationResultXdrDecoderInput(raw);
    if (!parsed.ok) { setHeld({ network, state: { status: "error", code: parsed.code } }); return; }
    setHeld({ network, state: { status: "loading" } });
    const result = await runOperationResultXdrDecoder(parsed.value, network);
    if (id !== requestId.current) return;
    setHeld({ network, state: result.ok ? { status: "success", result: result.value } : { status: "error", code: result.code } });
  }, [network]);
  const reset = useCallback(() => { requestId.current++; setHeld({ network, state: idle }); }, [network]);
  return { state, submit, reset };
}
