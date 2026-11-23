"use client";

import { useCallback, useState } from "react";
import { isErr } from "@/core/result/result";
import {
  parseFeeBumpReplacementComparatorInput,
  type RawFeeBumpReplacementComparatorInput
} from "@/features/fee-bump-replacement-comparator/schema";
import { compareFeeBumpReplacements } from "@/features/fee-bump-replacement-comparator/lib/feeBumpReplacementComparator";
import type {
  FeeBumpReplacementComparatorErrorCode,
  FeeBumpReplacementComparatorResult
} from "@/features/fee-bump-replacement-comparator/types";

export type FeeBumpReplacementComparatorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: FeeBumpReplacementComparatorResult }
  | {
      status: "error";
      code: FeeBumpReplacementComparatorErrorCode;
      detail?: "left" | "right" | "secret_key";
    };

/**
 * Comparing is synchronous and local. The loading state exists because the
 * contract requires all four, and it is entered and left within the same
 * update so no artificial delay is ever shown.
 */
export function useFeeBumpReplacementComparator() {
  const [state, setState] = useState<FeeBumpReplacementComparatorState>({ status: "idle" });

  /**
   * Increments every time a pasted secret key is refused, so the panel can
   * remount the form and wipe it out of the field.
   */
  const [redactions, setRedactions] = useState(0);

  const submit = useCallback((raw: RawFeeBumpReplacementComparatorInput) => {
    setState({ status: "loading" });

    const parsed = parseFeeBumpReplacementComparatorInput(raw);

    if (isErr(parsed)) {
      if (parsed.detail === "secret_key") setRedactions((count) => count + 1);
      setState({ status: "error", code: parsed.code, detail: parsed.detail });
      return;
    }

    const result = compareFeeBumpReplacements(parsed.value);
    setState(
      result.ok
        ? { status: "success", result: result.value }
        : { status: "error", code: result.code, detail: result.detail }
    );
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset, redactions };
}
