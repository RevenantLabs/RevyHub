import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { useLiquidityPoolInspector } from "@/features/liquidity-pool-inspector/hooks/useLiquidityPoolInspector";
import { handlers } from "@/features/liquidity-pool-inspector/msw/handlers";
import {
  missingPoolId,
  poolId
} from "@/features/liquidity-pool-inspector/fixtures/liquidityPoolInspector.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useLiquidityPoolInspector", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useLiquidityPoolInspector(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("loads a pool", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useLiquidityPoolInspector(), { wrapper });

    await act(async () => {
      await result.current.submit(poolId);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("rejects a malformed pool ID without a request", async () => {
    const { result } = renderHook(() => useLiquidityPoolInspector(), { wrapper });

    await act(async () => {
      await result.current.submit("not-a-pool-id");
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_pool_id" });
  });

  it("reports a pool that does not exist", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useLiquidityPoolInspector(), { wrapper });

    await act(async () => {
      await result.current.submit(missingPoolId);
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "pool_not_found" })
    );
  });

  it("clears state on reset", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useLiquidityPoolInspector(), { wrapper });

    await act(async () => {
      await result.current.submit(poolId);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
