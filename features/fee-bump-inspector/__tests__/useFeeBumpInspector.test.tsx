import { Networks } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useFeeBumpInspector } from "@/features/fee-bump-inspector/hooks/useFeeBumpInspector";
import {
  OTHER_PASSPHRASE,
  feeBumpXdr,
  notBase64,
  ordinaryXdr,
  secretSeed
} from "@/features/fee-bump-inspector/fixtures/feeBumpInspector.fixture";

const networkPassphrase = Networks.TESTNET;

describe("useFeeBumpInspector", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useFeeBumpInspector());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("reports both layers of a valid fee bump", () => {
    const { result } = renderHook(() => useFeeBumpInspector());

    act(() => result.current.submit({ envelope: feeBumpXdr, networkPassphrase }));

    expect(result.current.state.status).toBe("success");
    expect(result.current.state).toMatchObject({
      report: { inner: { operationCount: 2 }, feeBid: { chargeableOperations: 3 } }
    });
  });

  it("distinguishes an ordinary envelope from a bad paste", () => {
    const { result } = renderHook(() => useFeeBumpInspector());

    act(() => result.current.submit({ envelope: ordinaryXdr, networkPassphrase }));
    expect(result.current.state).toEqual({ status: "error", code: "not_fee_bump" });

    act(() => result.current.submit({ envelope: notBase64, networkPassphrase }));
    expect(result.current.state).toEqual({ status: "error", code: "invalid_input" });
  });

  it("requires a passphrase before it will hash anything", () => {
    const { result } = renderHook(() => useFeeBumpInspector());

    act(() => result.current.submit({ envelope: feeBumpXdr, networkPassphrase: "" }));

    expect(result.current.state).toEqual({ status: "error", code: "empty_passphrase" });
  });

  it("replaces a previous result rather than leaving it on screen", () => {
    const { result } = renderHook(() => useFeeBumpInspector());

    act(() => result.current.submit({ envelope: feeBumpXdr, networkPassphrase }));
    expect(result.current.state.status).toBe("success");

    act(() => result.current.submit({ envelope: ordinaryXdr, networkPassphrase }));
    expect(result.current.state.status).toBe("error");
  });

  it("re-derives the hashes when the passphrase changes", () => {
    const { result } = renderHook(() => useFeeBumpInspector());

    act(() => result.current.submit({ envelope: feeBumpXdr, networkPassphrase }));
    const first = result.current.state;

    act(() =>
      result.current.submit({ envelope: feeBumpXdr, networkPassphrase: OTHER_PASSPHRASE })
    );
    const second = result.current.state;

    expect(first.status === "success" && second.status === "success").toBe(true);
    if (first.status !== "success" || second.status !== "success") return;
    expect(second.report.outer.hash).not.toBe(first.report.outer.hash);
  });

  it("never keeps a pasted secret in hook state, and asks for a redaction", () => {
    const { result } = renderHook(() => useFeeBumpInspector());

    expect(result.current.redactions).toBe(0);

    act(() => result.current.submit({ envelope: secretSeed, networkPassphrase }));

    expect(result.current.state).toEqual({ status: "error", code: "invalid_input" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
    expect(result.current.redactions).toBe(1);
  });

  it("does not redact the field for an ordinary bad paste", () => {
    const { result } = renderHook(() => useFeeBumpInspector());

    act(() => result.current.submit({ envelope: notBase64, networkPassphrase }));

    expect(result.current.state).toEqual({ status: "error", code: "invalid_input" });
    expect(result.current.redactions).toBe(0);
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useFeeBumpInspector());

    act(() => result.current.submit({ envelope: feeBumpXdr, networkPassphrase }));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
