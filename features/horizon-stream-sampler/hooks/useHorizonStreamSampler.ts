"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseHorizonStreamSamplerInput } from "@/features/horizon-stream-sampler/schema";
import { runHorizonStreamSampler } from "@/features/horizon-stream-sampler/lib/horizonStreamSampler";
import { toHorizonStreamSamplerErrorCode } from "@/features/horizon-stream-sampler/lib/horizonStreamSampler.errors";
import type { HorizonStreamSamplerErrorCode, HorizonStreamSamplerResult, SampledEvent } from "@/features/horizon-stream-sampler/types";

export type HorizonStreamSamplerState =
  | { status: "idle" }
  | { status: "loading"; events: SampledEvent[] }
  | { status: "success"; result: HorizonStreamSamplerResult }
  | { status: "error"; code: HorizonStreamSamplerErrorCode };

export function useHorizonStreamSampler() {
  const { network } = useNetwork();
  const [state, setState] = useState<HorizonStreamSamplerState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseHorizonStreamSamplerInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading", events: [] });

      try {
        const result: Result<HorizonStreamSamplerResult, HorizonStreamSamplerErrorCode> = await runHorizonStreamSampler(
          parsed.value,
          network,
          next.signal,
          (event) => setState((current) => current.status === "loading" ? { status: "loading", events: [...current.events, event] } : current)
        );
        setState(
          result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code }
        );
      } catch (error) {
        if (next.signal.aborted) return;
        setState({ status: "error", code: toHorizonStreamSamplerErrorCode(error) });
      }
    },
    [network]
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  const stop = useCallback(() => controller.current?.abort(), []);
  useEffect(() => () => controller.current?.abort(), []);

  return { state, submit, reset, stop };
}
