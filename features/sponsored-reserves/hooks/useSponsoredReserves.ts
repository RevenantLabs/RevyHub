"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseSponsoredReservesInput } from "@/features/sponsored-reserves/schema";
import { runSponsoredReserves } from "@/features/sponsored-reserves/lib/sponsoredReserves";
import { toSponsoredReservesErrorCode } from "@/features/sponsored-reserves/lib/sponsoredReserves.errors";
import type { SponsoredReservesErrorCode, SponsoredReservesResult } from "@/features/sponsored-reserves/types";

export type SponsoredReservesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: SponsoredReservesResult }
  | { status: "error"; code: SponsoredReservesErrorCode };

export function useSponsoredReserves() {
  const { network } = useNetwork();
  const [state, setState] = useState<SponsoredReservesState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseSponsoredReservesInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<SponsoredReservesResult, SponsoredReservesErrorCode> = await runSponsoredReserves(
          parsed.value,
          network,
          next.signal
        );
        if (next.signal.aborted) return;
        setState(
          result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code }
        );
      } catch (error) {
        if (next.signal.aborted) return;
        setState({ status: "error", code: toSponsoredReservesErrorCode(error) });
      }
    },
    [network]
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
