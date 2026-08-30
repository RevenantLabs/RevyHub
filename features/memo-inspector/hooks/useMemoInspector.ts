"use client";

import { useCallback, useState } from "react";
import { isErr } from "@/core/result/result";
import { FIELD_OF_CODE, parseMemoForm, type RawMemoForm } from "@/features/memo-inspector/schema";
import { inspectMemo } from "@/features/memo-inspector/lib/memoInspector";
import { toMemoErrorCode } from "@/features/memo-inspector/lib/memoInspector.errors";
import type {
  DecodedMemo,
  MemoEncoding,
  MemoErrorCode,
  MemoField,
  MemoInput
} from "@/features/memo-inspector/types";

export type MemoInspectorState =
  | { status: "idle" }
  | { status: "encoding" }
  | { status: "success"; input: MemoInput; encoding: MemoEncoding; decoded: DecodedMemo }
  | { status: "error"; code: MemoErrorCode; field: MemoField | null };

/**
 * The memo state machine.
 *
 * Encoding is pure and synchronous, but the panel still has a loading state, so
 * `submit` yields once to the microtask queue after entering it rather than
 * inventing a timer. The state is therefore real and observable, and no delay
 * is added to a computation that takes microseconds.
 */
export function useMemoInspector() {
  const [state, setState] = useState<MemoInspectorState>({ status: "idle" });

  const fail = useCallback((code: MemoErrorCode) => {
    setState({ status: "error", code, field: FIELD_OF_CODE[code] });
  }, []);

  const submit = useCallback(
    async (raw: RawMemoForm) => {
      const parsed = parseMemoForm(raw);
      if (isErr(parsed)) {
        fail(parsed.code);
        return;
      }

      setState({ status: "encoding" });
      await Promise.resolve();

      try {
        const inspected = inspectMemo(parsed.value);
        if (isErr(inspected)) {
          fail(inspected.code);
          return;
        }

        setState({
          status: "success",
          input: parsed.value,
          encoding: inspected.value.encoding,
          decoded: inspected.value.decoded
        });
      } catch (error) {
        fail(toMemoErrorCode(error));
      }
    },
    [fail]
  );

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset };
}
