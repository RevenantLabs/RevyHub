import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useFeeBumpReplacementComparator } from "@/features/fee-bump-replacement-comparator/hooks/useFeeBumpReplacementComparator";
import {
  OTHER_PASSPHRASE,
  PASSPHRASE,
  currentFeeBumpXdr,
  higherFeeBumpXdr
} from "@/features/fee-bump-replacement-comparator/fixtures/normal.fixture";
import {
  notBase64,
  ordinaryXdr,
  secretSeed
} from "@/features/fee-bump-replacement-comparator/fixtures/boundary.fixture";

describe("useFeeBumpReplacementComparator", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useFeeBumpReplacementComparator());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("reports a successful replacement comparison", () => {
    const { result } = renderHook(() => useFeeBumpReplacementComparator());

    act(() =>
      result.current.submit({
        left: currentFeeBumpXdr,
        right: higherFeeBumpXdr,
        networkPassphrase: PASSPHRASE
      })
    );

    expect(result.current.state.status).toBe("success");
    expect(result.current.state).toMatchObject({
      result: { replacementCandidate: true }
    });
  });

  it("distinguishes an ordinary envelope from a bad paste", () => {
    const { result } = renderHook(() => useFeeBumpReplacementComparator());

    act(() =>
      result.current.submit({
        left: currentFeeBumpXdr,
        right: ordinaryXdr,
        networkPassphrase: PASSPHRASE
      })
    );
    expect(result.current.state).toEqual({
      status: "error",
      code: "unsupported_variant",
      detail: "right"
    });

    act(() =>
      result.current.submit({
        left: notBase64,
        right: higherFeeBumpXdr,
        networkPassphrase: PASSPHRASE
      })
    );
    expect(result.current.state).toEqual({
      status: "error",
      code: "invalid_input",
      detail: "left"
    });
  });

  it("requires a passphrase before it will hash anything", () => {
    const { result } = renderHook(() => useFeeBumpReplacementComparator());

    act(() =>
      result.current.submit({
        left: currentFeeBumpXdr,
        right: higherFeeBumpXdr,
        networkPassphrase: ""
      })
    );

    expect(result.current.state).toEqual({ status: "error", code: "empty_input" });
  });

  it("replaces a previous result rather than leaving it on screen", () => {
    const { result } = renderHook(() => useFeeBumpReplacementComparator());

    act(() =>
      result.current.submit({
        left: currentFeeBumpXdr,
        right: higherFeeBumpXdr,
        networkPassphrase: PASSPHRASE
      })
    );
    expect(result.current.state.status).toBe("success");

    act(() =>
      result.current.submit({
        left: currentFeeBumpXdr,
        right: ordinaryXdr,
        networkPassphrase: PASSPHRASE
      })
    );
    expect(result.current.state.status).toBe("error");
  });

  it("re-derives the hashes when the passphrase changes", () => {
    const { result } = renderHook(() => useFeeBumpReplacementComparator());

    act(() =>
      result.current.submit({
        left: currentFeeBumpXdr,
        right: higherFeeBumpXdr,
        networkPassphrase: PASSPHRASE
      })
    );
    const first = result.current.state;

    act(() =>
      result.current.submit({
        left: currentFeeBumpXdr,
        right: higherFeeBumpXdr,
        networkPassphrase: OTHER_PASSPHRASE
      })
    );
    const second = result.current.state;

    expect(first.status === "success" && second.status === "success").toBe(true);
    if (first.status !== "success" || second.status !== "success") return;
    expect(second.result.left.innerHash).not.toBe(first.result.left.innerHash);
  });

  it("never keeps a pasted secret in hook state, and asks for a redaction", () => {
    const { result } = renderHook(() => useFeeBumpReplacementComparator());

    expect(result.current.redactions).toBe(0);

    act(() =>
      result.current.submit({
        left: secretSeed,
        right: higherFeeBumpXdr,
        networkPassphrase: PASSPHRASE
      })
    );

    expect(result.current.state).toMatchObject({ status: "error", code: "invalid_input" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
    expect(result.current.redactions).toBe(1);
  });

  it("does not redact the field for an ordinary bad paste", () => {
    const { result } = renderHook(() => useFeeBumpReplacementComparator());

    act(() =>
      result.current.submit({
        left: notBase64,
        right: higherFeeBumpXdr,
        networkPassphrase: PASSPHRASE
      })
    );

    expect(result.current.state).toMatchObject({ status: "error", code: "invalid_input" });
    expect(result.current.redactions).toBe(0);
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useFeeBumpReplacementComparator());

    act(() =>
      result.current.submit({
        left: currentFeeBumpXdr,
        right: higherFeeBumpXdr,
        networkPassphrase: PASSPHRASE
      })
    );
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
