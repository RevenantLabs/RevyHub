import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTransactionBalanceChangeReconciler } from "@/features/transaction-balance-change-reconciler/hooks/useTransactionBalanceChangeReconciler";
import { unexplainedResidual } from "@/features/transaction-balance-change-reconciler/fixtures/boundary.fixture";
import {
  normalPayment,
  notBase64,
  secretSeed
} from "@/features/transaction-balance-change-reconciler/fixtures/normal.fixture";

describe("useTransactionBalanceChangeReconciler", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useTransactionBalanceChangeReconciler());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("reconciles a valid triple", () => {
    const { result } = renderHook(() => useTransactionBalanceChangeReconciler());

    act(() => result.current.submit(normalPayment));

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.result.fullyReconciled).toBe(true);
    }
  });

  it("clears a stale success when the next submit fails", () => {
    const { result } = renderHook(() => useTransactionBalanceChangeReconciler());

    act(() => result.current.submit(normalPayment));
    expect(result.current.state.status).toBe("success");

    act(() =>
      result.current.submit({ ...normalPayment, metaXdr: notBase64 })
    );
    expect(result.current.state).toEqual({ status: "error", code: "malformed_data" });
  });

  it("keeps incomplete evidence as success with reasons", () => {
    const { result } = renderHook(() => useTransactionBalanceChangeReconciler());

    act(() => result.current.submit(unexplainedResidual));

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.result.fullyReconciled).toBe(false);
      expect(result.current.state.result.evidence.incompleteReasons.length).toBeGreaterThan(0);
    }
  });

  it("never keeps a pasted secret in hook state, and asks for a redaction", () => {
    const { result } = renderHook(() => useTransactionBalanceChangeReconciler());

    expect(result.current.redactions).toBe(0);

    act(() =>
      result.current.submit({ ...normalPayment, envelopeXdr: secretSeed })
    );

    expect(result.current.state).toEqual({ status: "error", code: "invalid_input" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
    expect(result.current.redactions).toBe(1);
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useTransactionBalanceChangeReconciler());

    act(() => result.current.submit(normalPayment));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
