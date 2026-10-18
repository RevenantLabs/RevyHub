"use client";

import { useCallback, useState } from "react";
import { isErr } from "@/core/result/result";
import { parseManageDataInput, type RawManageDataInput } from "@/features/manage-data-codec/schema";
import { buildManageData } from "@/features/manage-data-codec/lib/manageDataCodec";
import type {
  ManageDataEntry,
  ManageDataErrorCode
} from "@/features/manage-data-codec/types";

export type ManageDataCodecState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; entry: ManageDataEntry }
  | { status: "error"; code: ManageDataErrorCode };

/**
 * Encoding is synchronous and local. The loading state exists because the
 * contract requires all four, and it is entered and left within the same
 * update so no artificial delay is ever shown.
 */
export function useManageDataCodec() {
  const [state, setState] = useState<ManageDataCodecState>({ status: "idle" });

  /**
   * Increments every time a pasted secret key is refused.
   *
   * The panel keys the form on this counter, so a rejected seed is wiped from
   * whichever field it was typed into instead of sitting there in plain text.
   */
  const [redactions, setRedactions] = useState(0);

  const submit = useCallback((raw: RawManageDataInput) => {
    setState({ status: "loading" });

    const parsed = parseManageDataInput(raw);

    if (isErr(parsed)) {
      if (parsed.detail === "secret_key") setRedactions((count) => count + 1);
      setState({ status: "error", code: parsed.code });
      return;
    }

    const result = buildManageData(parsed.value);
    setState(
      result.ok
        ? { status: "success", entry: result.value }
        : { status: "error", code: result.code }
    );
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, submit, reset, redactions };
}
