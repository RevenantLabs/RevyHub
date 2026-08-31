"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseSep7SignatureVerifierInput } from "@/features/sep7-signature-verifier/schema";
import { runSep7SignatureVerifier } from "@/features/sep7-signature-verifier/lib/sep7SignatureVerifier";
import { toSep7SignatureVerifierErrorCode } from "@/features/sep7-signature-verifier/lib/sep7SignatureVerifier.errors";
import type { Sep7SignatureVerifierErrorCode, Sep7SignatureVerifierResult } from "@/features/sep7-signature-verifier/types";

export type Sep7SignatureVerifierState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: Sep7SignatureVerifierResult }
  | { status: "error"; code: Sep7SignatureVerifierErrorCode };

export function useSep7SignatureVerifier() {
  const { network } = useNetwork();
  const [state, setState] = useState<Sep7SignatureVerifierState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseSep7SignatureVerifierInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<Sep7SignatureVerifierResult, Sep7SignatureVerifierErrorCode> = await runSep7SignatureVerifier(
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
        setState({ status: "error", code: toSep7SignatureVerifierErrorCode(error) });
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
