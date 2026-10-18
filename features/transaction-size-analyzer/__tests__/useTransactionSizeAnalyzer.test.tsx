import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTransactionSizeAnalyzer } from "@/features/transaction-size-analyzer/hooks/useTransactionSizeAnalyzer";
import {
  feeBumpXdr,
  notBase64,
  secretSeed,
  singleOperationXdr,
  twoOperationXdr
} from "@/features/transaction-size-analyzer/fixtures/transactionSize.fixture";

describe("useTransactionSizeAnalyzer", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useTransactionSizeAnalyzer());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("measures a valid envelope", () => {
    const { result } = renderHook(() => useTransactionSizeAnalyzer());

    act(() => result.current.submit({ envelope: twoOperationXdr, budget: "" }));

    expect(result.current.state.status).toBe("success");
    expect(result.current.state).toMatchObject({
      report: { kind: "classic-v1", breakdownComplete: true }
    });
  });

  it("recognises a fee bump and reports an inner layer", () => {
    const { result } = renderHook(() => useTransactionSizeAnalyzer());

    act(() => result.current.submit({ envelope: feeBumpXdr, budget: "" }));

    expect(result.current.state).toMatchObject({ report: { kind: "fee-bump" } });
    expect(
      result.current.state.status === "success" && result.current.state.report.inner
    ).not.toBeNull();
  });

  it("separates a bad envelope from a bad budget", () => {
    const { result } = renderHook(() => useTransactionSizeAnalyzer());

    act(() => result.current.submit({ envelope: notBase64, budget: "" }));
    expect(result.current.state).toEqual({ status: "error", code: "invalid_input" });

    act(() => result.current.submit({ envelope: twoOperationXdr, budget: "12.5" }));
    expect(result.current.state).toEqual({ status: "error", code: "invalid_budget" });
  });

  it("replaces a previous measurement rather than leaving it on screen", () => {
    const { result } = renderHook(() => useTransactionSizeAnalyzer());

    act(() => result.current.submit({ envelope: twoOperationXdr, budget: "" }));
    const first =
      result.current.state.status === "success" ? result.current.state.report.totalBytes : 0;

    act(() => result.current.submit({ envelope: singleOperationXdr, budget: "" }));
    const second =
      result.current.state.status === "success" ? result.current.state.report.totalBytes : 0;

    expect(second).toBeLessThan(first);
  });

  it("clears a stale result when the next submission fails", () => {
    const { result } = renderHook(() => useTransactionSizeAnalyzer());

    act(() => result.current.submit({ envelope: twoOperationXdr, budget: "" }));
    expect(result.current.state.status).toBe("success");

    act(() => result.current.submit({ envelope: notBase64, budget: "" }));
    expect(result.current.state.status).toBe("error");
  });

  it("never keeps a pasted secret in hook state", () => {
    const { result } = renderHook(() => useTransactionSizeAnalyzer());

    act(() => result.current.submit({ envelope: secretSeed, budget: "" }));

    expect(result.current.state).toEqual({ status: "error", code: "invalid_input" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useTransactionSizeAnalyzer());

    act(() => result.current.submit({ envelope: twoOperationXdr, budget: "" }));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
