import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAccountSnapshotDiff } from "@/features/account-snapshot-diff/hooks/useAccountSnapshotDiff";
import {
  balanceDownJson,
  baseJson,
  notAnAccountJson,
  otherAccountJson,
  secretSeed,
  signerAddedJson,
  snapshotWithSecretJson
} from "@/features/account-snapshot-diff/fixtures/accountSnapshotDiff.fixture";

const base = { before: baseJson, after: balanceDownJson };

describe("useAccountSnapshotDiff", () => {
  it("starts idle, showing changes by default", () => {
    const { result } = renderHook(() => useAccountSnapshotDiff());

    expect(result.current.state).toEqual({ status: "idle" });
    expect(result.current.section).toBe("all");
    expect(result.current.changeFilter).toBe("changed");
    expect(result.current.visibleChanges).toEqual([]);
  });

  it("compares two snapshots", () => {
    const { result } = renderHook(() => useAccountSnapshotDiff());

    act(() => result.current.submit(base));

    expect(result.current.state.status).toBe("success");
    expect(result.current.visibleChanges.length).toBeGreaterThan(0);
    expect(result.current.visibleChanges.every((change) => change.type !== "unchanged")).toBe(
      true
    );
  });

  it("narrows by section and by change type together", () => {
    const { result } = renderHook(() => useAccountSnapshotDiff());

    act(() => result.current.submit({ before: baseJson, after: signerAddedJson }));

    act(() => result.current.setSection("signers"));
    expect(result.current.visibleChanges.every((change) => change.section === "signers")).toBe(
      true
    );

    act(() => result.current.setChangeFilter("all"));
    expect(result.current.visibleChanges.length).toBeGreaterThan(0);

    act(() => result.current.setSection("flags"));
    // Nothing about the flags moved, and "all" still shows the unchanged rows.
    expect(result.current.visibleChanges.every((change) => change.section === "flags")).toBe(true);
  });

  it("leaves the underlying diff untouched while filtering", () => {
    const { result } = renderHook(() => useAccountSnapshotDiff());

    act(() => result.current.submit(base));
    const total =
      result.current.state.status === "success" ? result.current.state.diff.changes.length : 0;

    act(() => result.current.setSection("signers"));

    expect(
      result.current.state.status === "success" && result.current.state.diff.changes.length
    ).toBe(total);
  });

  it("can produce an empty view, and reset back out of it", () => {
    const { result } = renderHook(() => useAccountSnapshotDiff());

    act(() => result.current.submit({ before: baseJson, after: baseJson }));
    // Identical snapshots plus the default "changed" filter shows nothing.
    expect(result.current.visibleChanges).toEqual([]);

    act(() => result.current.setChangeFilter("all"));
    expect(result.current.visibleChanges.length).toBeGreaterThan(0);

    act(() => result.current.resetFilters());
    expect(result.current.changeFilter).toBe("changed");
    expect(result.current.section).toBe("all");
  });

  it("clears stale filters when a new pair is submitted", () => {
    const { result } = renderHook(() => useAccountSnapshotDiff());

    act(() => result.current.submit(base));
    act(() => result.current.setSection("flags"));
    act(() => result.current.setChangeFilter("unchanged"));

    act(() => result.current.submit({ before: baseJson, after: signerAddedJson }));

    expect(result.current.section).toBe("all");
    expect(result.current.changeFilter).toBe("changed");
  });

  it("reports a mismatched pair without clearing the inputs", () => {
    const { result } = renderHook(() => useAccountSnapshotDiff());

    act(() => result.current.submit({ before: baseJson, after: otherAccountJson }));

    expect(result.current.state).toEqual({ status: "error", code: "account_mismatch" });
    expect(result.current.redactions).toBe(0);
  });

  it("clears a stale result when the next comparison fails", () => {
    const { result } = renderHook(() => useAccountSnapshotDiff());

    act(() => result.current.submit(base));
    expect(result.current.state.status).toBe("success");

    act(() => result.current.submit({ before: notAnAccountJson, after: baseJson }));
    expect(result.current.state).toEqual({ status: "error", code: "invalid_snapshot" });
    expect(result.current.visibleChanges).toEqual([]);
  });

  it("never keeps a pasted secret in hook state, and asks for a redaction", () => {
    const { result } = renderHook(() => useAccountSnapshotDiff());

    act(() => result.current.submit({ ...base, before: snapshotWithSecretJson }));

    expect(result.current.state).toEqual({ status: "error", code: "invalid_input" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
    expect(result.current.redactions).toBe(1);
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useAccountSnapshotDiff());

    act(() => result.current.submit(base));
    act(() => result.current.setSection("balances"));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
    expect(result.current.section).toBe("all");
  });
});
