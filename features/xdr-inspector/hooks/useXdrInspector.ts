"use client";

import { useCallback, useState } from "react";
import { isErr } from "@/core/result/result";
import { parseXdrInput } from "@/features/xdr-inspector/schema";
import { inspectEnvelope } from "@/features/xdr-inspector/lib/xdrInspector";
import type { EnvelopeSummary, XdrErrorCode } from "@/features/xdr-inspector/types";

export type XdrInspectorState =
  | { status: "idle" }
  | { status: "success"; summary: EnvelopeSummary }
  | { status: "error"; code: XdrErrorCode };

/**
 * Decoding is synchronous and local, so there is no loading state: adding one
 * would only put a fake delay in front of a pure function.
 */
export function useXdrInspector() {
  const [state, setState] = useState<XdrInspectorState>({ status: "idle" });

  const submit = useCallback((raw: string) => {
    const parsed = parseXdrInput(raw);

    if (isErr(parsed)) {
      setState({ status: "error", code: parsed.code });
      return;
    }

    const result = inspectEnvelope(parsed.value);
    setState(
      result.ok
        ? { status: "success", summary: result.value }
        : { status: "error", code: result.code }
    );
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}
