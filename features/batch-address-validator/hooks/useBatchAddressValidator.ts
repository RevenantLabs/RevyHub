"use client";

import { useCallback, useState } from "react";
import { isErr } from "@/core/result/result";
import { parseBatchAddressValidatorInput } from "@/features/batch-address-validator/schema";
import { runBatchAddressValidator } from "@/features/batch-address-validator/lib/batchAddressValidator";
import type {
  BatchAddressValidatorErrorCode,
  BatchAddressValidatorResult
} from "@/features/batch-address-validator/types";

export type BatchAddressValidatorState =
  | { status: "idle" }
  | { status: "result"; result: BatchAddressValidatorResult }
  | { status: "error"; code: BatchAddressValidatorErrorCode };

/**
 * Validation is synchronous and local, so this hook has no loading state:
 * introducing one would only add a fake delay to a pure function.
 */
export function useBatchAddressValidator() {
  const [state, setState] = useState<BatchAddressValidatorState>({ status: "idle" });

  const submit = useCallback((raw: string) => {
    const parsed = parseBatchAddressValidatorInput(raw);

    if (isErr(parsed)) {
      setState({ status: "error", code: parsed.code });
      return;
    }

    const result = runBatchAddressValidator(parsed.value);
    setState({ status: "result", result });
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}
