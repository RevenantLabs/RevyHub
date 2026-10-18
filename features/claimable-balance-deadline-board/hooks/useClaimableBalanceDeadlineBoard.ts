"use client";
import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { parseDeadlineBoardInput } from "../schema";
import { runClaimableBalanceDeadlineBoard } from "../lib/claimableBalanceDeadlineBoard";
import type { DeadlineBoardState } from "../types";

export function useClaimableBalanceDeadlineBoard() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<{ network: StellarNetwork; state: DeadlineBoardState }>({ network, state: { status: "idle" } });
  const controller = useRef<AbortController | null>(null);
  const state: DeadlineBoardState = held.network === network ? held.state : { status: "idle" };
  const submit = useCallback(async (raw: { claimant: string; cursor?: string }) => {
    controller.current?.abort();
    const parsed = parseDeadlineBoardInput(raw);
    if (!parsed.ok) {
      setHeld({ network, state: { status: "error", code: parsed.code, field: parsed.code === "invalid_claimant" ? "claimant" : "cursor" } });
      return;
    }
    const next = new AbortController();
    controller.current = next;
    setHeld({ network, state: { status: "loading" } });
    const result = await runClaimableBalanceDeadlineBoard(parsed.value, network, next.signal);
    if (next.signal.aborted) return;
    setHeld({ network, state: result.ok ? { status: "success", result: result.value } : { status: "error", code: result.code, field: result.code === "invalid_cursor" ? "cursor" : null } });
  }, [network]);
  return { state, submit };
}
