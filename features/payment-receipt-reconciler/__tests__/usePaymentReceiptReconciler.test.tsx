import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { usePaymentReceiptReconciler } from "@/features/payment-receipt-reconciler/hooks/usePaymentReceiptReconciler";
import { handlers } from "@/features/payment-receipt-reconciler/msw/handlers";
import {
  missingHash,
  successfulHash
} from "@/features/payment-receipt-reconciler/fixtures/paymentReceiptReconciler.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("usePaymentReceiptReconciler", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => usePaymentReceiptReconciler(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("loads a reconciled receipt", async () => {
    const { result } = renderHook(() => usePaymentReceiptReconciler(), { wrapper });

    await act(async () => {
      await result.current.submit(successfulHash);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("rejects a malformed hash without a request", async () => {
    const { result } = renderHook(() => usePaymentReceiptReconciler(), { wrapper });

    await act(async () => {
      await result.current.submit("not-a-hash");
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_hash" });
  });

  it("reports a hash that does not exist", async () => {
    const { result } = renderHook(() => usePaymentReceiptReconciler(), { wrapper });

    await act(async () => {
      await result.current.submit(missingHash);
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: "error",
        code: "transaction_not_found"
      })
    );
  });

  it("clears state on reset", async () => {
    const { result } = renderHook(() => usePaymentReceiptReconciler(), { wrapper });

    await act(async () => {
      await result.current.submit(successfulHash);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("derives away results when the network changes", async () => {
    const { result } = renderHook(
      () => ({ tool: usePaymentReceiptReconciler(), network: useNetwork() }),
      { wrapper }
    );

    await act(async () => {
      await result.current.tool.submit(successfulHash);
    });
    await waitFor(() => expect(result.current.tool.state.status).toBe("success"));

    act(() => result.current.network.setNetwork("mainnet"));
    expect(result.current.tool.state).toEqual({ status: "idle" });
  });
});
