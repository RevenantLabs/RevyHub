"use client";

import { useCallback, useState } from "react";
import { isErr } from "@/core/result/result";
import { parseFeeBumpInput, type RawFeeBumpInput } from "@/features/fee-bump-inspector/schema";
import { inspectFeeBump } from "@/features/fee-bump-inspector/lib/feeBumpInspector";
import type { FeeBumpErrorCode, FeeBumpReport } from "@/features/fee-bump-inspector/types";

export type FeeBumpInspectorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; report: FeeBumpReport }
  | { status: "error"; code: FeeBumpErrorCode };

/**
 * Decoding is synchronous and local. The loading state exists because the
 * contract requires all four states, and it is entered and left inside the
 * same update so no artificial delay is ever shown to the user.
 */
export function useFeeBumpInspector() {
  const [state, setState] = useState<FeeBumpInspectorState>({ status: "idle" });

  /**
   * Increments every time a pasted secret key is refused.
   *
   * The panel keys the form on this counter, so a rejected seed is wiped from
   * the textarea instead of sitting there in plain text. Nothing derived from
   * the seed — not the value, not its length — is kept.
   */
  const [redactions, setRedactions] = useState(0);

  const submit = useCallback((raw: RawFeeBumpInput) => {
    setState({ status: "loading" });

    const parsed = parseFeeBumpInput(raw);

    if (isErr(parsed)) {
      if (parsed.detail === "secret_key") setRedactions((count) => count + 1);
      setState({ status: "error", code: parsed.code });
      return;
    }

    const result = inspectFeeBump(parsed.value);
    setState(
      result.ok
        ? { status: "success", report: result.value }
        : { status: "error", code: result.code }
    );
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset, redactions };
}
