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
      const previous = controller.current;
      controller.current = null;
      previous?.abort();
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
          (event) => {
            if (controller.current !== next) return;
            setState((current) => current.status === "loading" ? { status: "loading", events: [...current.events, event] } : current);
          }
        );
        if (controller.current !== next) return;
        setState(
          result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code }
        );
      } catch (error) {
        if (controller.current !== next || next.signal.aborted) return;
        setState({ status: "error", code: toHorizonStreamSamplerErrorCode(error) });
      }
    },
    [network]
  );

  const reset = useCallback(() => {
    const active = controller.current;
    controller.current = null;
    active?.abort();
    setState({ status: "idle" });
  }, []);

  const stop = useCallback(() => controller.current?.abort(), []);
  useEffect(() => () => {
    const active = controller.current;
    controller.current = null;
    active?.abort();
  }, [network]);

  return { state, submit, reset, stop };
}
