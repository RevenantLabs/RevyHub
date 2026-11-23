"use client";
import { useCallback, useRef, useState } from "react";
import { parseInput, type RawInput } from "@/features/claimable-predicate-evaluator/schema";
import { runClaimablePredicateEvaluator } from "@/features/claimable-predicate-evaluator/lib/claimablePredicateEvaluator";
import { toEvaluatorErrorCode } from "@/features/claimable-predicate-evaluator/lib/claimablePredicateEvaluator.errors";
import type { ErrorCode, EvaluatorResult } from "@/features/claimable-predicate-evaluator/types";
export type EvaluatorState = { status: "idle" } | { status: "loading" } | { status: "error"; code: ErrorCode } | { status: "success" | "incomplete"; result: EvaluatorResult };
export function useClaimablePredicateEvaluator() {
  const [state, setState] = useState<EvaluatorState>({ status: "idle" });
  const generation = useRef(0);
  const [redactions, setRedactions] = useState(0);
  const submit = useCallback(async (raw: RawInput) => {
    const current = ++generation.current;
    if (raw.claimant.trim().startsWith("S") || /\bS[A-Z2-7]{1,55}\b/.test(raw.text)) setRedactions((n) => n + 1);
    setState({ status: "loading" });
    await Promise.resolve();
    if (current !== generation.current) return;
    try {
      const parsed = parseInput(raw);
      const result = parsed.ok ? runClaimablePredicateEvaluator(parsed.value) : parsed;
      if (current !== generation.current) return;
      setState(result.ok ? { status: result.value.evidence === "complete" ? "success" : "incomplete", result: result.value } : { status: "error", code: result.code });
    } catch (error) {
      if (current === generation.current) setState({ status: "error", code: toEvaluatorErrorCode(error) });
    }
  }, []);
  const reset = useCallback(() => { generation.current++; setState({ status: "idle" }); }, []);
  return { state, submit, reset, redactions };
}
