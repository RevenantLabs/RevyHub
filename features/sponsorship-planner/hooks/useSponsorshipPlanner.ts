"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { errorFieldFor, parseSponsorshipPlannerInput } from "@/features/sponsorship-planner/schema";
import { runSponsorshipPlanner } from "@/features/sponsorship-planner/lib/sponsorshipPlanner";
import type {
  SponsorshipPlannerErrorCode,
  SponsorshipPlannerField,
  SponsorshipPlannerResult
} from "@/features/sponsorship-planner/types";

export type SponsorshipPlannerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: SponsorshipPlannerResult }
  | {
      status: "error";
      code: SponsorshipPlannerErrorCode;
      field: SponsorshipPlannerField | undefined;
    };

const IDLE: SponsorshipPlannerState = { status: "idle" };

interface HeldState {
  state: SponsorshipPlannerState;
  network: StellarNetwork;
}

export function useSponsorshipPlanner() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<HeldState>({ state: IDLE, network });
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (rawSponsor: string, rawSponsored: string) => {
      controller.current?.abort();
      requestId.current += 1;
      const id = requestId.current;
      const parsed = parseSponsorshipPlannerInput(rawSponsor, rawSponsored);

      if (isErr(parsed)) {
        setHeld({
          state: {
            status: "error",
            code: parsed.code,
            field: errorFieldFor(parsed.code)
          },
          network
        });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setHeld({ state: { status: "loading" }, network });

      const result = await runSponsorshipPlanner(parsed.value, network, next.signal);
      if (id !== requestId.current || next.signal.aborted) return;

      setHeld({
        state: result.ok
          ? { status: "success", data: result.value }
          : { status: "error", code: result.code, field: undefined },
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
