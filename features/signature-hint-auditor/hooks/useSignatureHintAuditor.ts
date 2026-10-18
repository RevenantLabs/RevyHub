"use client";

import { useCallback, useState } from "react";
import { isErr } from "@/core/result/result";
import {
  parseSignatureHintAuditorInput,
  type RawSignatureHintAuditorInput
} from "@/features/signature-hint-auditor/schema";
import { auditSignatureHints } from "@/features/signature-hint-auditor/lib/signatureHintAuditor";
import type {
  SignatureHintAuditorErrorCode,
  SignatureHintAuditorResult
} from "@/features/signature-hint-auditor/types";

export type SignatureHintAuditorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: SignatureHintAuditorResult }
  | { status: "error"; code: SignatureHintAuditorErrorCode };

/**
 * Auditing is synchronous and local. The loading state exists because the
 * contract requires all four states, and it is entered and left inside the
 * same update so no artificial delay is ever shown.
 */
export function useSignatureHintAuditor() {
  const [state, setState] = useState<SignatureHintAuditorState>({ status: "idle" });

  /**
   * Increments whenever a pasted secret key is refused so the panel can remount
   * the form and wipe the seed from the textarea.
   */
  const [redactions, setRedactions] = useState(0);

  const submit = useCallback((raw: RawSignatureHintAuditorInput) => {
    setState({ status: "loading" });

    const parsed = parseSignatureHintAuditorInput(raw);

    if (isErr(parsed)) {
      if (parsed.detail === "secret_key") setRedactions((count) => count + 1);
      setState({ status: "error", code: parsed.code });
      return;
    }

    const result = auditSignatureHints(parsed.value);
    setState(
      result.ok
        ? { status: "success", result: result.value }
        : { status: "error", code: result.code }
    );
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset, redactions };
}
