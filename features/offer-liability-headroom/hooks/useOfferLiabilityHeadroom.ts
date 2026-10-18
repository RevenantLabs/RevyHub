"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import type { StellarNetwork } from "@/core/network/types";
import { isErr, type Result } from "@/core/result/result";
import { parseOfferLiabilityHeadroomInput } from "@/features/offer-liability-headroom/schema";
import { runOfferLiabilityHeadroom } from "@/features/offer-liability-headroom/lib/offerLiabilityHeadroom";
import { toOfferLiabilityHeadroomErrorCode } from "@/features/offer-liability-headroom/lib/offerLiabilityHeadroom.errors";
import type {
  OfferLiabilityHeadroomErrorCode,
  OfferLiabilityHeadroomResult
} from "@/features/offer-liability-headroom/types";

export type OfferLiabilityHeadroomState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: OfferLiabilityHeadroomResult }
  | { status: "error"; code: OfferLiabilityHeadroomErrorCode };

const IDLE: OfferLiabilityHeadroomState = { status: "idle" };

interface Held {
  state: OfferLiabilityHeadroomState;
  network: StellarNetwork;
}

export function useOfferLiabilityHeadroom() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const controller = useRef<AbortController | null>(null);
  const requestId = useRef(0);
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseOfferLiabilityHeadroomInput(raw);
      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      const next = new AbortController();
      controller.current = next;
      setHeld({ state: { status: "loading" }, network });

      try {
        const result: Result<OfferLiabilityHeadroomResult, OfferLiabilityHeadroomErrorCode> =
          await runOfferLiabilityHeadroom(parsed.value, network, next.signal);
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
          state: { status: "error", code: toOfferLiabilityHeadroomErrorCode(error) },
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
