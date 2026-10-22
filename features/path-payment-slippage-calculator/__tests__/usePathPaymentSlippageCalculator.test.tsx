import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { usePathPaymentSlippageCalculator } from "@/features/path-payment-slippage-calculator/hooks/usePathPaymentSlippageCalculator";

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("usePathPaymentSlippageCalculator", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => usePathPaymentSlippageCalculator(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports invalid_hash for empty input", async () => {
    const { result } = renderHook(() => usePathPaymentSlippageCalculator(), { wrapper });
    await act(async () => {
      await result.current.submit("");
    });
    await waitFor(() => expect(result.current.state.status).toBe("error"));
    expect(result.current.state).toEqual({ status: "error", code: "invalid_hash" });
  });
});
