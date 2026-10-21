"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { planReserveCapacity } from "@/features/reserve-capacity-planner/lib/reserveCapacityPlanner";
import { toReserveCapacityPlannerErrorCode } from "@/features/reserve-capacity-planner/lib/reserveCapacityPlanner.errors";
import { parseReserveCapacityPlannerInput } from "@/features/reserve-capacity-planner/schema";
import type {
  PlannerField,
  ReserveCapacityPlannerErrorCode,
  ReserveCapacityPlannerRawInput,
  ReserveCapacityPlannerResult
} from "@/features/reserve-capacity-planner/types";

export type ReserveCapacityPlannerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: ReserveCapacityPlannerResult }
  | { status: "error"; code: ReserveCapacityPlannerErrorCode; field?: PlannerField };

/**
 * Yields once so a fully local projection still passes through a processing
 * state. The work itself does not touch the network.
 */
function waitForLocalProcessing(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export function useReserveCapacityPlanner() {
  const { network } = useNetwork();
  const [state, setState] = useState<ReserveCapacityPlannerState>({ status: "idle" });
  const generation = useRef(0);

  const submit = useCallback(async (raw: ReserveCapacityPlannerRawInput) => {
    const id = ++generation.current;
    const parsed = parseReserveCapacityPlannerInput(raw);
    if (!parsed.ok) {
      setState({ status: "error", code: parsed.code, field: parsed.detail });
      return;
    }

    setState({ status: "loading" });
    await waitForLocalProcessing();
    if (id !== generation.current) return;

    try {
      setState({ status: "success", result: planReserveCapacity(parsed.value) });
    } catch (error) {
      if (id !== generation.current) return;
      setState({ status: "error", code: toReserveCapacityPlannerErrorCode(error) });
    }
  }, []);

  const reset = useCallback(() => {
    generation.current += 1;
    setState({ status: "idle" });
  }, []);

  const rejectSecret = useCallback((field: PlannerField) => {
    generation.current += 1;
    setState({ status: "error", code: "secret_rejected", field });
  }, []);

  return { state, submit, reset, rejectSecret, network };
}
