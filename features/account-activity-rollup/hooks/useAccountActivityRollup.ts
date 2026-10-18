"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { parseAccountActivityRollupInput } from "@/features/account-activity-rollup/schema";
import { loadNextActivityPage, runAccountActivityRollup } from "@/features/account-activity-rollup/lib/accountActivityRollup";
import type { AccountActivityRollupState } from "@/features/account-activity-rollup/types";

const IDLE: AccountActivityRollupState = { status: "idle" };
interface Held { state: AccountActivityRollupState; network: StellarNetwork }

export function useAccountActivityRollup() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const controller = useRef<AbortController | null>(null);
  const state = held.network === network ? held.state : IDLE;

  useEffect(() => () => controller.current?.abort(), []);

  const submit = useCallback(async (raw: string) => {
    controller.current?.abort();
    const parsed = parseAccountActivityRollupInput(raw);
    if (!parsed.ok) {
      setHeld({ state: { status: "error", code: parsed.code }, network });
      return;
    }
    const next = new AbortController();
    controller.current = next;
    setHeld({ state: { status: "loading" }, network });
    const result = await runAccountActivityRollup(parsed.value, network, next.signal);
    if (next.signal.aborted) return;
    setHeld({ network, state: result.ok
      ? { status: "success", result: result.value, paging: false, pageError: null }
      : { status: "error", code: result.code } });
  }, [network]);

  const loadMore = useCallback(async () => {
    if (state.status !== "success" || state.paging || !state.result.cursor) return;
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    setHeld({ network, state: { ...state, paging: true, pageError: null } });
    const result = await loadNextActivityPage(state.result, network, next.signal);
    if (next.signal.aborted) return;
    setHeld({ network, state: result.ok
      ? { status: "success", result: result.value, paging: false, pageError: null }
      : { status: "success", result: state.result, paging: false, pageError: result.code } });
  }, [network, state]);

  return { state, submit, loadMore };
}
