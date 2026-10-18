"use client";

import { useCallback, useRef, useState } from "react";
import { isErr, type Result } from "@/core/result/result";
import { parseSorobanFootprintDiffInput } from "@/features/soroban-footprint-diff/schema";
import { runSorobanFootprintDiff } from "@/features/soroban-footprint-diff/lib/sorobanFootprintDiff";
import { toSorobanFootprintDiffErrorCode } from "@/features/soroban-footprint-diff/lib/sorobanFootprintDiff.errors";
import type {
  RawSorobanFootprintDiffForm
} from "@/features/soroban-footprint-diff/schema";
import type {
  SorobanFootprintDiffErrorCode,
  SorobanFootprintDiffResult
} from "@/features/soroban-footprint-diff/types";

export type SorobanFootprintDiffState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: SorobanFootprintDiffResult }
  | { status: "error"; code: SorobanFootprintDiffErrorCode };

export function useSorobanFootprintDiff() {
  const [state, setState] = useState<SorobanFootprintDiffState>({ status: "idle" });
  const generation = useRef(0);

  const submit = useCallback(async (raw: RawSorobanFootprintDiffForm) => {
    const id = ++generation.current;
    const parsed = parseSorobanFootprintDiffInput(raw);
    if (isErr(parsed)) {
      setState({ status: "error", code: parsed.code });
      return;
    }

    setState({ status: "loading" });
    try {
      const result: Result<SorobanFootprintDiffResult, SorobanFootprintDiffErrorCode> =
        await runSorobanFootprintDiff(parsed.value);
      if (id !== generation.current) return;
      setState(
        result.ok
          ? { status: "success", result: result.value }
          : { status: "error", code: result.code }
      );
    } catch (error) {
      if (id !== generation.current) return;
      setState({ status: "error", code: toSorobanFootprintDiffErrorCode(error) });
    }
  }, []);

  const reset = useCallback(() => {
    generation.current += 1;
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
