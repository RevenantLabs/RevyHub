"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseOfferInspectorInput } from "@/features/offer-inspector/schema";
import {
  loadMoreOffers,
  runOfferInspector
} from "@/features/offer-inspector/lib/offerInspector";
import { toOfferInspectorErrorCode } from "@/features/offer-inspector/lib/offerInspector.errors";
import type {
  OfferInspectorErrorCode,
  OfferInspectorResult
} from "@/features/offer-inspector/types";

export type OfferInspectorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: OfferInspectorResult; loadingMore?: boolean }
  | { status: "error"; code: OfferInspectorErrorCode };

const IDLE: OfferInspectorState = { status: "idle" };

interface Held {
  state: OfferInspectorState;
  network: StellarNetwork;
}

/** Hook managing input validation, Horizon fetching, network changes, and cursor pagination. */
export function useOfferInspector() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const controller = useRef<AbortController | null>(null);

  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseOfferInspectorInput(raw);
      if (isErr(parsed)) {
        setHeld({ status: "error", code: parsed.code } as unknown as Held);
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setHeld({ state: { status: "loading" }, network });

      try {
        const result: Result<OfferInspectorResult, OfferInspectorErrorCode> =
          await runOfferInspector(parsed.value, network, next.signal);
        if (next.signal.aborted) {
          return;
        }
        setHeld({
          state: result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code },
          network
        });
      } catch (error) {
        if (next.signal.aborted) {
          return;
        }
        setHeld({
          state: { status: "error", code: toOfferInspectorErrorCode(error) },
          network
        });
      }
    },
    [network]
  );

  const loadMore = useCallback(async () => {
    if (state.status !== "success" || !state.result.nextCursor || state.loadingMore) {
      return;
    }

    setHeld({
      state: { ...state, loadingMore: true },
      network
    });

    const nextResult = await loadMoreOffers(state.result);
    if (nextResult.ok) {
      setHeld({
        state: { status: "success", result: nextResult.value, loadingMore: false },
        network
      });
    } else {
      setHeld({
        state: { status: "error", code: nextResult.code },
        network
      });
    }
  }, [network, state]);

  const reset = useCallback(() => {
    controller.current?.abort();
    setHeld({ state: IDLE, network });
  }, [network]);

  return { state, submit, loadMore, reset };
}

