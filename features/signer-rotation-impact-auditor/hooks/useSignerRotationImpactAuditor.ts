"use client";

import { useCallback, useRef, useState } from "react";
import { isErr } from "@/core/result/result";
import { auditSignerRotation } from "@/features/signer-rotation-impact-auditor/lib/signerRotationImpactAuditor";
import {
  parseSignerRotationInput,
  type RawSignerRotationInput
} from "@/features/signer-rotation-impact-auditor/schema";
import type {
  SignerRotationErrorCode,
  SignerRotationResult
} from "@/features/signer-rotation-impact-auditor/types";

export type SignerRotationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: SignerRotationResult }
  | { status: "error"; code: SignerRotationErrorCode };

/**
 * Auditing is synchronous and local. The loading state exists because the
 * contract requires all four UI states; it is entered and left in the same
 * turn so no artificial delay is shown.
 *
 * A generation counter drops obsolete results if a later submit finishes the
 * parse path first — relevant if the domain work is ever made async.
 */
export function useSignerRotationImpactAuditor() {
  const [state, setState] = useState<SignerRotationState>({ status: "idle" });
  const [redactions, setRedactions] = useState(0);
  const generation = useRef(0);

  const submit = useCallback((raw: RawSignerRotationInput) => {
    const current = ++generation.current;
    setState({ status: "loading" });

    const parsed = parseSignerRotationInput(raw);

    if (isErr(parsed)) {
      if (current !== generation.current) return;
      if (parsed.code === "invalid_input") setRedactions((count) => count + 1);
      setState({ status: "error", code: parsed.code });
      return;
    }

    const result = auditSignerRotation(parsed.value);

    if (current !== generation.current) return;

    setState(
      result.ok
        ? { status: "success", result: result.value }
        : { status: "error", code: result.code }
    );
  }, []);

  const reset = useCallback(() => {
    generation.current += 1;
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset, redactions };
}
