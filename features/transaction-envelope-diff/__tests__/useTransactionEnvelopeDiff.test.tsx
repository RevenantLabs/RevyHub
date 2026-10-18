import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTransactionEnvelopeDiff } from "@/features/transaction-envelope-diff/hooks/useTransactionEnvelopeDiff";
import {
  PASSPHRASE,
  baseXdr,
  changedAmountXdr,
  notBase64,
  secretSeed,
  signedXdr
} from "@/features/transaction-envelope-diff/fixtures/envelopeDiff.fixture";

const base = { left: baseXdr, right: changedAmountXdr, networkPassphrase: PASSPHRASE };

describe("useTransactionEnvelopeDiff", () => {
  it("starts idle, showing changes by default", () => {
    const { result } = renderHook(() => useTransactionEnvelopeDiff());

    expect(result.current.state).toEqual({ status: "idle" });
    // A reviewer opens this tool to see what moved, so "changed" is the default.
    expect(result.current.filter).toBe("changed");
    expect(result.current.visibleEntries).toEqual([]);
  });

  it("compares two envelopes", () => {
    const { result } = renderHook(() => useTransactionEnvelopeDiff());

    act(() => result.current.submit(base));

    expect(result.current.state.status).toBe("success");
    expect(result.current.visibleEntries.length).toBeGreaterThan(0);
    expect(result.current.visibleEntries.every((entry) => entry.status !== "unchanged")).toBe(
      true
    );
  });

  it("widens and narrows the view without touching the diff", () => {
    const { result } = renderHook(() => useTransactionEnvelopeDiff());

    act(() => result.current.submit(base));
    const changedCount = result.current.visibleEntries.length;

    act(() => result.current.setFilter("all"));
    expect(result.current.visibleEntries.length).toBeGreaterThan(changedCount);

    act(() => result.current.setFilter("unchanged"));
    expect(result.current.visibleEntries.every((entry) => entry.status === "unchanged")).toBe(
      true
    );

    // The summary itself never changed.
    expect(
      result.current.state.status === "success" && result.current.state.summary.changedCount
    ).toBe(changedCount);
  });

  it("shows an empty view for identical envelopes, and recovers on reset", () => {
    const { result } = renderHook(() => useTransactionEnvelopeDiff());

    act(() => result.current.submit({ ...base, right: baseXdr }));

    expect(result.current.state).toMatchObject({ summary: { identical: true } });
    // Nothing changed, so the default filter legitimately shows nothing.
    expect(result.current.visibleEntries).toEqual([]);

    act(() => result.current.setFilter("all"));
    expect(result.current.visibleEntries.length).toBeGreaterThan(0);
  });

  it("clears a stale filter when a new pair is submitted", () => {
    const { result } = renderHook(() => useTransactionEnvelopeDiff());

    act(() => result.current.submit(base));
    act(() => result.current.setFilter("unchanged"));

    act(() => result.current.submit({ ...base, right: signedXdr }));

    expect(result.current.filter).toBe("changed");
  });

  it("reports a signature-only difference as such", () => {
    const { result } = renderHook(() => useTransactionEnvelopeDiff());

    act(() => result.current.submit({ ...base, right: signedXdr }));

    expect(result.current.state).toMatchObject({ summary: { signaturesOnly: true } });
  });

  it("clears a stale result when the next comparison fails", () => {
    const { result } = renderHook(() => useTransactionEnvelopeDiff());

    act(() => result.current.submit(base));
    expect(result.current.state.status).toBe("success");

    act(() => result.current.submit({ ...base, right: notBase64 }));
    expect(result.current.state).toEqual({ status: "error", code: "invalid_right_xdr" });
    expect(result.current.visibleEntries).toEqual([]);
  });

  it("never keeps a pasted secret in hook state, and asks for a redaction", () => {
    const { result } = renderHook(() => useTransactionEnvelopeDiff());

    expect(result.current.redactions).toBe(0);

    act(() => result.current.submit({ ...base, left: secretSeed }));

    expect(result.current.state).toEqual({ status: "error", code: "invalid_input" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
    expect(result.current.redactions).toBe(1);
  });

  it("does not redact the field for an ordinary bad paste", () => {
    const { result } = renderHook(() => useTransactionEnvelopeDiff());

    act(() => result.current.submit({ ...base, left: notBase64 }));

    expect(result.current.state).toEqual({ status: "error", code: "invalid_left_xdr" });
    expect(result.current.redactions).toBe(0);
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useTransactionEnvelopeDiff());

    act(() => result.current.submit(base));
    act(() => result.current.setFilter("all"));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
    expect(result.current.filter).toBe("changed");
  });
});
