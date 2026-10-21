"use client";

import { useCallback, useState } from "react";
import { parseInput } from "../schema";
import { previewContractDeploy } from "../lib/contractDeployPreview";
import { unexpectedFailure } from "../lib/contractDeployPreview.errors";
import type { ContractDeployPreview, ErrorCode } from "../types";

export type State =
  | { status: "idle" }
  | { status: "success"; result: ContractDeployPreview }
  | { status: "error"; code: ErrorCode; operationTypes?: string[] };

/**
 * Decoding is synchronous and entirely local, so there is no loading state —
 * this tool never makes a request, see `manifest.ts`'s `offline: true`.
 */
export function useContractDeployPreview() {
  const [state, setState] = useState<State>({ status: "idle" });

  const submit = useCallback((raw: string) => {
    const parsed = parseInput(raw);
    if (!parsed.ok) {
      setState({ status: "error", code: parsed.code });
      return;
    }
    try {
      const result = previewContractDeploy(parsed.value);
      setState(
        result.ok
          ? { status: "success", result: result.value }
          : { status: "error", code: result.code, operationTypes: result.detail }
      );
    } catch {
      setState({ status: "error", code: unexpectedFailure() });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}
