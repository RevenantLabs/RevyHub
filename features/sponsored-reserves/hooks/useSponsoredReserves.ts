"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseSponsoredReservesInput } from "@/features/sponsored-reserves/schema";
import { runSponsoredReserves } from "@/features/sponsored-reserves/lib/sponsoredReserves";
import type {
  SponsoredReservesErrorCode,
  SponsoredReservesResult
} from "@/features/sponsored-reserves/types";

export type SponsoredReservesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: SponsoredReservesResult }
  | { status: "error"; code: SponsoredReservesErrorCode };

const IDLE: SponsoredReservesState = { status: "idle" };

interface HeldState {
  state: SponsoredReservesState;
  network: StellarNetwork;
}

export function useSponsoredReserves() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<HeldState>({ state: IDLE, network });
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      requestId.current += 1;
      const id = requestId.current;
      const parsed = parseSponsoredReservesInput(raw);

      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setHeld({ state: { status: "loading" }, network });

      const result = await runSponsoredReserves(parsed.value, network, next.signal);
      if (id !== requestId.current || next.signal.aborted) return;

      setHeld({
        state: result.ok
          ? { status: "success", data: result.value }
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
