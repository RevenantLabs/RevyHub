"use client";

import { useCallback, useState } from "react";
import { isErr } from "@/core/result/result";
import { parseMuxedAccountCodecInput } from "@/features/muxed-account-codec/schema";
import { runMuxedAccountCodec } from "@/features/muxed-account-codec/lib/muxedAccountCodec";
import type {
  MuxedAccountCodecErrorCode,
  MuxedAccountCodecResult,
  RawMuxedAccountCodecInput
} from "@/features/muxed-account-codec/types";

export type MuxedAccountCodecState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: MuxedAccountCodecResult }
  | { status: "error"; code: MuxedAccountCodecErrorCode };

/**
 * State machine hook for muxed account encoding and decoding.
 */
export function useMuxedAccountCodec() {
  const [state, setState] = useState<MuxedAccountCodecState>({ status: "idle" });

  const submit = useCallback((raw: RawMuxedAccountCodecInput | string) => {
    const parsed = parseMuxedAccountCodecInput(raw);
    if (isErr(parsed)) {
      setState({ status: "error", code: parsed.code });
      return;
    }

    const result = runMuxedAccountCodec(parsed.value);
    setState(
      result.ok
        ? { status: "success", result: result.value }
        : { status: "error", code: result.code }
    );
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
