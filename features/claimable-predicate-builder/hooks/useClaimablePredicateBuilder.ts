"use client";

import { useCallback, useRef, useState } from "react";
import { isErr, type Result } from "@/core/result/result";
import { parseClaimablePredicateBuilderInput } from "@/features/claimable-predicate-builder/schema";
import { runClaimablePredicateBuilder } from "@/features/claimable-predicate-builder/lib/claimablePredicateBuilder";
import { toClaimablePredicateBuilderErrorCode } from "@/features/claimable-predicate-builder/lib/claimablePredicateBuilder.errors";
import type {
  ClaimablePredicateBuilderErrorCode,
  ClaimablePredicateBuilderResult
} from "@/features/claimable-predicate-builder/types";

export type ClaimablePredicateBuilderState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: ClaimablePredicateBuilderResult }
  | { status: "error"; code: ClaimablePredicateBuilderErrorCode };

export function useClaimablePredicateBuilder() {
  const [state, setState] = useState<ClaimablePredicateBuilderState>({ status: "idle" });
  const controller = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (raw: string) => {
      controller.current?.abort();
      const parsed = parseClaimablePredicateBuilderInput(raw);
      if (isErr(parsed)) {
        setState({ status: "error", code: parsed.code });
        return;
      }

      const next = new AbortController();
      controller.current = next;
      setState({ status: "loading" });

      try {
        const result: Result<
          ClaimablePredicateBuilderResult,
          ClaimablePredicateBuilderErrorCode
        > = await runClaimablePredicateBuilder(parsed.value);
        if (next.signal.aborted) return;
        setState(
          result.ok
            ? { status: "success", result: result.value }
            : { status: "error", code: result.code }
        );
      } catch (error) {
        if (next.signal.aborted) return;
        setState({ status: "error", code: toClaimablePredicateBuilderErrorCode(error) });
      }
    },
    []
  );

  const reset = useCallback(() => {
    controller.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
