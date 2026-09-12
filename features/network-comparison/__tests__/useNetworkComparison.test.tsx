import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { resetHorizonClients } from "@/core/horizon/client";
import { withMswHandlers } from "@/core/testing/msw";
import { useNetworkComparison } from "@/features/network-comparison/hooks/useNetworkComparison";
import {
  bothErrorHandler,
  handlers,
  testnetErrorHandler
} from "@/features/network-comparison/msw/handlers";

const server = withMswHandlers(...handlers);

describe("useNetworkComparison", () => {
  it("starts in idle state without initiating requests", () => {
    const { result } = renderHook(() => useNetworkComparison());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("transitions through loading to success on fetch", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useNetworkComparison());

    await act(async () => {
      await result.current.load();
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    if (result.current.state.status !== "success") return;

    expect(result.current.state.data.testnet.status).toBe("online");
    expect(result.current.state.data.mainnet.status).toBe("online");
  });

  it("transitions to error with partial data when one network fails", async () => {
    server.use(testnetErrorHandler);
    resetHorizonClients();
    const { result } = renderHook(() => useNetworkComparison());

    await act(async () => {
      await result.current.load();
    });

    await waitFor(() => expect(result.current.state.status).toBe("error"));
    if (result.current.state.status !== "error") return;

    expect(result.current.state.code).toBe("partial_failure");
    expect(result.current.state.partial).toBeDefined();
    expect(result.current.state.partial?.mainnet.status).toBe("online");
    expect(result.current.state.partial?.testnet.status).toBe("unreachable");
  });

  it("transitions to error code both_unreachable when both networks fail", async () => {
    server.use(...bothErrorHandler);
    resetHorizonClients();
    const { result } = renderHook(() => useNetworkComparison());

    await act(async () => {
      await result.current.load();
    });

    await waitFor(() => expect(result.current.state.status).toBe("error"));
    if (result.current.state.status !== "error") return;

    expect(result.current.state.code).toBe("both_unreachable");
  });

  it("resets state back to idle on reset", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useNetworkComparison());

    await act(async () => {
      await result.current.load();
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
