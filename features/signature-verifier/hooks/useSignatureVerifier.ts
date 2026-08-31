"use client";

import { useCallback, useRef, useState } from "react";
import { useNetwork } from "@/core/network/NetworkProvider";
import { isErr, type Result } from "@/core/result/result";
import { parseSignatureVerifierInput } from "@/features/signature-verifier/schema";
import { runSignatureVerifier } from "@/features/signature-verifier/lib/signatureVerifier";
import { toSignatureVerifierErrorCode } from "@/features/signature-verifier/lib/signatureVerifier.errors";
import type { SignatureVerifierErrorCode, SignatureVerifierResult } from "@/features/signature-verifier/types";

export type SignatureVerifierState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: SignatureVerifierResult }
  | { status: "error"; code: SignatureVerifierErrorCode };

export function useSignatureVerifier() {
  const { network } = useNetwork();
  const [state, setState] = useState<SignatureVerifierState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseSignatureVerifierInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<SignatureVerifierResult, SignatureVerifierErrorCode> = await runSignatureVerifier(
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
        setState({ status: "error", code: toSignatureVerifierErrorCode(error) });
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
