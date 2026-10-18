"use client";

import { useCallback, useMemo, useState } from "react";
import { isErr } from "@/core/result/result";
import { parseSnapshotInput } from "@/features/account-snapshot-diff/schema";
import { diffSnapshots } from "@/features/account-snapshot-diff/lib/accountSnapshotDiff";
import { filterChanges } from "@/features/account-snapshot-diff/lib/format";
import type {
  ChangeFilter,
  SectionFilter,
  SnapshotDiff,
  SnapshotErrorCode,
  SnapshotInput
} from "@/features/account-snapshot-diff/types";

export type AccountSnapshotDiffState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; diff: SnapshotDiff }
  | { status: "error"; code: SnapshotErrorCode };

/**
 * Comparing is synchronous and local. The loading state exists because the
 * contract requires all four, and it is entered and left within the same
 * update so no artificial delay is ever shown.
 */
export function useAccountSnapshotDiff() {
  const [state, setState] = useState<AccountSnapshotDiffState>({ status: "idle" });
  const [section, setSection] = useState<SectionFilter>("all");
  const [changeFilter, setChangeFilter] = useState<ChangeFilter>("changed");

  /**
   * Increments every time a pasted secret key is refused, so the panel can
   * remount the form and wipe it out of the field.
   */
  const [redactions, setRedactions] = useState(0);

  const submit = useCallback((raw: SnapshotInput) => {
    setState({ status: "loading" });

    const parsed = parseSnapshotInput(raw);

    if (isErr(parsed)) {
      if (parsed.code === "invalid_input") setRedactions((count) => count + 1);
      setState({ status: "error", code: parsed.code });
      return;
    }

    const result = diffSnapshots(parsed.value);

    // A new comparison starts from the default view. Carrying filters across
    // would show an empty table for a diff that is not empty at all.
    setSection("all");
    setChangeFilter("changed");
    setState(
      result.ok
        ? { status: "success", diff: result.value }
        : { status: "error", code: result.code }
    );
  }, []);

  /**
   * Derived during render rather than stored beside the diff, so the visible
   * rows can never drift from the comparison they came from.
   */
  const visibleChanges = useMemo(
    () =>
      state.status === "success"
        ? filterChanges(state.diff.changes, section, changeFilter)
        : [],
    [state, section, changeFilter]
  );

  const resetFilters = useCallback(() => {
    setSection("all");
    setChangeFilter("changed");
  }, []);

  const reset = useCallback(() => {
    resetFilters();
    setState({ status: "idle" });
  }, [resetFilters]);

  return {
    state,
    section,
    setSection,
    changeFilter,
    setChangeFilter,
    visibleChanges,
    resetFilters,
    submit,
    reset,
    redactions
  };
}
