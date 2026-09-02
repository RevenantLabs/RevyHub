"use client";

import { useCallback, useRef, useState } from "react";
import { isErr, type Result } from "@/core/result/result";
import { parseSorobanAuthInspectorInput } from "@/features/soroban-auth-inspector/schema";
import { runSorobanAuthInspector } from "@/features/soroban-auth-inspector/lib/sorobanAuthInspector";
import { toSorobanAuthInspectorErrorCode } from "@/features/soroban-auth-inspector/lib/sorobanAuthInspector.errors";
import type {
  SorobanAuthInspectorErrorCode,
  SorobanAuthInspectorResult
} from "@/features/soroban-auth-inspector/types";

export type SorobanAuthInspectorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: SorobanAuthInspectorResult }
  | { status: "error"; code: SorobanAuthInspectorErrorCode };

const IDLE: SorobanAuthInspectorState = { status: "idle" };

export function useSorobanAuthInspector() {
  const [state, setState] = useState<SorobanAuthInspectorState>(IDLE);
  const requestId = useRef(0);

  const submit = useCallback(async (raw: string) => {
    const parsed = parseSorobanAuthInspectorInput(raw);
    if (isErr(parsed)) {
      setState({ status: "error", code: parsed.code });
      return;
    }

    requestId.current += 1;
    const id = requestId.current;
    setState({ status: "loading" });

    try {
      const result: Result<SorobanAuthInspectorResult, SorobanAuthInspectorErrorCode> =
        runSorobanAuthInspector(parsed.value);

      if (id !== requestId.current) return;

      setState(
        result.ok
          ? { status: "success", result: result.value }
          : { status: "error", code: result.code }
      );
    } catch (error) {
      if (id !== requestId.current) return;
      setState({ status: "error", code: toSorobanAuthInspectorErrorCode(error) });
    }
  }, []);

  const reset = useCallback(() => {
    requestId.current += 1;
    setState(IDLE);
  }, []);

  return { state, submit, reset };
}
