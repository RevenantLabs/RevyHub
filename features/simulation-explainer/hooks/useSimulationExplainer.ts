"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import { parseSimulationExplainerInput } from "@/features/simulation-explainer/schema";
import { runSimulationExplainer } from "@/features/simulation-explainer/lib/simulationExplainer";
import { toSimulationExplainerErrorCode } from "@/features/simulation-explainer/lib/simulationExplainer.errors";
import type {
  SimulationExplainerErrorCode,
  SimulationExplainerResult
} from "@/features/simulation-explainer/types";

export type SimulationExplainerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: SimulationExplainerResult }
  | { status: "error"; code: SimulationExplainerErrorCode };

const IDLE: SimulationExplainerState = { status: "idle" };

interface Held {
  state: SimulationExplainerState;
  network: StellarNetwork;
}

export function useSimulationExplainer() {
  const { network } = useNetwork();
  const [held, setHeld] = useState<Held>({ state: IDLE, network });
  const requestId = useRef(0);

  const state = held.network === network ? held.state : IDLE;

  const submit = useCallback(
    async (raw: string) => {
      const parsed = parseSimulationExplainerInput(raw);
      if (isErr(parsed)) {
        setHeld({ state: { status: "error", code: parsed.code }, network });
        return;
      }

      requestId.current += 1;
      const id = requestId.current;
      setHeld({ state: { status: "loading" }, network });

      try {
        const result: Result<SimulationExplainerResult, SimulationExplainerErrorCode> =
          await runSimulationExplainer(parsed.value, network);

        if (id !== requestId.current) return;

        setHeld({
          state: result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code },
          network
        });
      } catch (error) {
        if (id !== requestId.current) return;
        setHeld({
          state: { status: "error", code: toSimulationExplainerErrorCode(error) },
          network
        });
      }
    },
    [network]
  );

  const reset = useCallback(() => {
    requestId.current += 1;
    setHeld({ state: IDLE, network });
  }, [network]);

  return { state, submit, reset };
}
