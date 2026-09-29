"use client";

import { useCallback, useState } from "react";
import { isErr } from "@/core/result/result";
import {
  FIELD_OF_CODE,
  parsePredicateBuilderInput
} from "@/features/predicate-builder/schema";
import { buildPredicate } from "@/features/predicate-builder/lib/predicateBuilder";
import type {
  PredicateBuilderErrorCode,
  PredicateBuilderField,
  PredicateBuilderResult,
  RawPredicateForm
} from "@/features/predicate-builder/types";

export type PredicateBuilderState =
  | { status: "idle" }
  | { status: "encoding" }
  | { status: "success"; result: PredicateBuilderResult }
  | { status: "error"; code: PredicateBuilderErrorCode; field: PredicateBuilderField };

const IDLE: PredicateBuilderState = { status: "idle" };

/**
 * The predicate builder state machine.
 * 
 * Encoding is synchronous and local, but the panel still has a loading state
 * to provide visual feedback. The state yields once to the microtask queue
 * after entering the encoding state.
 */
export function usePredicateBuilder() {
  const [state, setState] = useState<PredicateBuilderState>(IDLE);

  const submit = useCallback(async (raw: RawPredicateForm | null) => {
    const parsed = parsePredicateBuilderInput(raw);
    
    if (isErr(parsed)) {
      setState({
        status: "error",
        code: parsed.code,
        field: FIELD_OF_CODE[parsed.code]
      });
      return;
    }

    setState({ status: "encoding" });
    await Promise.resolve(); // Yield to microtask queue for loading state

    const result = buildPredicate(parsed.value);
    
    if (isErr(result)) {
      setState({
        status: "error",
        code: result.code,
        field: FIELD_OF_CODE[result.code]
      });
      return;
    }

    setState({ status: "success", result: result.value });
  }, []);

  const reset = useCallback(() => {
    setState(IDLE);
  }, []);

  return { state, submit, reset };
}
