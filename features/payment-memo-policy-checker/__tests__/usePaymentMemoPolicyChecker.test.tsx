import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { usePaymentMemoPolicyChecker } from "@/features/payment-memo-policy-checker/hooks/usePaymentMemoPolicyChecker";

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("usePaymentMemoPolicyChecker", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => usePaymentMemoPolicyChecker(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports an error for empty input", async () => {
    const { result } = renderHook(() => usePaymentMemoPolicyChecker(), { wrapper });
    await act(async () => {
      await result.current.submit("");
    });
    await waitFor(() => expect(result.current.state.status).toBe("error"));
  });
});
