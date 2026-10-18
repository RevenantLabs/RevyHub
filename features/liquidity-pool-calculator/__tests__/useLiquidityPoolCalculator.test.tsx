import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { useLiquidityPoolCalculator } from "@/features/liquidity-pool-calculator/hooks/useLiquidityPoolCalculator";

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useLiquidityPoolCalculator", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useLiquidityPoolCalculator(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports an error for empty input", async () => {
    const { result } = renderHook(() => useLiquidityPoolCalculator(), { wrapper });
    await act(async () => {
      await result.current.submit("");
    });
    await waitFor(() => expect(result.current.state.status).toBe("error"));
  });
});
