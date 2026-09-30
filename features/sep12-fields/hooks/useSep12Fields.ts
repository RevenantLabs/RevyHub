"use client";

import { useCallback, useState } from "react";
import { isErr } from "@/core/result/result";
import { parseSep12FieldsInput } from "@/features/sep12-fields/schema";
import { searchFields } from "@/features/sep12-fields/lib/sep12Fields";
import type {
  Sep12FieldsErrorCode,
  Sep12FieldsResult
} from "@/features/sep12-fields/types";

export type Sep12FieldsState =
  | { status: "idle" }
  | { status: "success"; result: Sep12FieldsResult }
  | { status: "error"; code: Sep12FieldsErrorCode };

/**
 * Searching is synchronous over a table compiled into the bundle, so there is
 * no loading state: one would only put a fake delay in front of a filter. The
 * absence of a loading state describes the tool rather than a missing state.
 */
export function useSep12Fields() {
  const [state, setState] = useState<Sep12FieldsState>({ status: "idle" });

  const submit = useCallback((raw: string) => {
    const parsed = parseSep12FieldsInput(raw);

    if (isErr(parsed)) {
      setState({ status: "error", code: parsed.code });
      return;
    }

    setState({ status: "success", result: searchFields(parsed.value.query) });
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}
