"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseEffectsTimelineInput } from "@/features/effects-timeline/schema";
import { loadEffectsPage } from "@/features/effects-timeline/lib/effectsTimeline";
import type {
  EffectsTimelineErrorCode,
  EffectsTimelinePage
} from "@/features/effects-timeline/types";

export type EffectsTimelineState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; page: EffectsTimelinePage; pageIndex: number }
  | { status: "error"; code: EffectsTimelineErrorCode };

const IDLE: EffectsTimelineState = { status: "idle" };

/** What it takes to re-request a page, so going back is a replay, not a guess. */
interface PageRequest {
  cursor?: string;
  carryTransactionId?: string;
}

interface Held {
  state: EffectsTimelineState;
  network: StellarNetwork;
}

export function useEffectsTimeline() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);
  /** `trail.current[i]` is the request that produced page `i`. */
  const trail = useRef<PageRequest[]>([]);

  // An account's history belongs to the network it was read from, so a result
  // from the other network is derived away instead of reset in an effect.
  const state = held.network === network ? held.state : IDLE;

  const load = useCallback(
    async (accountId: string, pageIndex: number) => {
      controller.current?.abort();
      requestId.current += 1;
      const id = requestId.current;
      const next = new AbortController();
      controller.current = next;

      setHeld({ state: { status: "loading" }, network });

      const request = trail.current[pageIndex] ?? {};
      const result = await loadEffectsPage({ accountId }, network, {
        cursor: request.cursor,
        carryTransactionId: request.carryTransactionId,
        signal: next.signal
      });

      if (id !== requestId.current || next.signal.aborted) return;

      setHeld({
        state: result.ok
          ? { status: "success", page: result.value, pageIndex }
          : { status: "error", code: result.code },
        network
      });
    },
    [network]
  );

  const submit = useCallback(
    async (raw: string) => {
      const parsed = parseEffectsTimelineInput(raw);

      if (isErr(parsed)) {
        controller.current?.abort();
        requestId.current += 1;
        trail.current = [];
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      trail.current = [{}];
      await load(parsed.value.accountId, 0);
    },
    [load, network]
  );

  const showOlder = useCallback(async () => {
    if (state.status !== "success" || !state.page.hasOlder) return;

    const pageIndex = state.pageIndex + 1;
    trail.current = trail.current.slice(0, pageIndex);
    trail.current[pageIndex] = {
      cursor: state.page.olderCursor ?? undefined,
      carryTransactionId: state.page.carryTransactionId ?? undefined
    };

    await load(state.page.accountId, pageIndex);
  }, [load, state]);

  const showNewer = useCallback(async () => {
    if (state.status !== "success" || state.pageIndex === 0) return;
    await load(state.page.accountId, state.pageIndex - 1);
  }, [load, state]);

  const reset = useCallback(() => {
    controller.current?.abort();
    requestId.current += 1;
    trail.current = [];
    setHeld({ state: IDLE, network });
  }, [network]);

  return { state, submit, showOlder, showNewer, reset };
}
