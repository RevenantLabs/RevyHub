"use client";

import { useCallback, useMemo, useState } from "react";
import { isErr } from "@/core/result/result";
import { parseDiffInput, type RawDiffInput } from "@/features/transaction-envelope-diff/schema";
import { diffEnvelopes } from "@/features/transaction-envelope-diff/lib/envelopeDiff";
import { filterEntries } from "@/features/transaction-envelope-diff/lib/format";
import type {
  DiffErrorCode,
  DiffFilter,
  DiffSummary
} from "@/features/transaction-envelope-diff/types";

export type TransactionEnvelopeDiffState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; summary: DiffSummary }
  | { status: "error"; code: DiffErrorCode };

/**
 * Comparing is synchronous and local. The loading state exists because the
 * contract requires all four, and it is entered and left within the same
 * update so no artificial delay is ever shown.
 */
export function useTransactionEnvelopeDiff() {
  const [state, setState] = useState<TransactionEnvelopeDiffState>({ status: "idle" });
  const [filter, setFilter] = useState<DiffFilter>("changed");

  /**
   * Increments every time a pasted secret key is refused, so the panel can
   * remount the form and wipe it out of the field.
   */
  const [redactions, setRedactions] = useState(0);

  const submit = useCallback((raw: RawDiffInput) => {
    setState({ status: "loading" });

    const parsed = parseDiffInput(raw);

    if (isErr(parsed)) {
      if (parsed.code === "invalid_input") setRedactions((count) => count + 1);
      setState({ status: "error", code: parsed.code });
      return;
    }

    const result = diffEnvelopes(parsed.value);

    // A new comparison starts from the default view. Carrying a filter across
    // would show an empty table for a diff that is not empty at all.
    setFilter("changed");
    setState(
      result.ok
        ? { status: "success", summary: result.value }
        : { status: "error", code: result.code }
    );
  }, []);

  /**
   * Derived during render rather than stored beside the summary, so the
   * visible rows can never drift from the diff they came from.
   */
  const visibleEntries = useMemo(
    () => (state.status === "success" ? filterEntries(state.summary.entries, filter) : []),
    [state, filter]
  );

  const resetFilter = useCallback(() => setFilter("changed"), []);
  const reset = useCallback(() => {
    setFilter("changed");
    setState({ status: "idle" });
  }, []);

  return { state, filter, setFilter, visibleEntries, resetFilter, submit, reset, redactions };
}
