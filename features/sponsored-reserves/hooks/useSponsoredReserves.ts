"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseSponsoredReservesInput } from "@/features/sponsored-reserves/schema";
import { loadSponsoredReserves } from "@/features/sponsored-reserves/lib/sponsoredReserves";
import type {
  SponsoredReservesResultData,
  SponsoredReservesErrorCode
} from "@/features/sponsored-reserves/types";

export type SponsoredReservesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: SponsoredReservesResultData }
  | { status: "error"; code: SponsoredReservesErrorCode };

const IDLE: SponsoredReservesState = { status: "idle" };

interface Held {
  state: SponsoredReservesState;
  network: StellarNetwork;
}

export function useSponsoredReserves() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);

  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: string) => {
      const parsed = parseSponsoredReservesInput(raw);

      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      setHeld({ state: { status: "loading" }, network });

      const result = await loadSponsoredReserves(parsed.value, network);

      if (id !== requestId.current) return;

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
    requestId.current += 1;
    setHeld({ state: IDLE, network });
  }, [network]);

  return { state, submit, reset };
}
