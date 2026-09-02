"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseScvalCodecInput } from "@/features/scval-codec/schema";
import { runScvalCodec } from "@/features/scval-codec/lib/scvalCodec";
import { toScvalCodecErrorCode } from "@/features/scval-codec/lib/scvalCodec.errors";
import type { ScvalCodecErrorCode, ScvalCodecResult } from "@/features/scval-codec/types";

export type ScvalCodecState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: ScvalCodecResult }
  | { status: "error"; code: ScvalCodecErrorCode };

export function useScvalCodec() {
  const { network } = useNetwork();
  const [state, setState] = useState<ScvalCodecState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string, mode: string) => {
      controller.current?.abort();
      const parsed = parseScvalCodecInput(raw, mode);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<ScvalCodecResult, ScvalCodecErrorCode> = await runScvalCodec(
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
        setState({ status: "error", code: toScvalCodecErrorCode(error) });
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
