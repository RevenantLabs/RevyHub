import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { normalExpected, normalRaw } from "@/features/reserve-capacity-planner/fixtures/reserveCapacityPlanner.fixture";
import { useReserveCapacityPlanner } from "@/features/reserve-capacity-planner/hooks/useReserveCapacityPlanner";
import { handlers } from "@/features/reserve-capacity-planner/msw/handlers";

withMswHandlers(...handlers);

function wrapper({ children }: { children: ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useReserveCapacityPlanner", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts idle", () => {
    const { result } = renderHook(() => useReserveCapacityPlanner(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("rejects a bad count without entering a success state", async () => {
    const { result } = renderHook(() => useReserveCapacityPlanner(), { wrapper });
    await act(async () => {
      await result.current.submit({ ...normalRaw, offers: "-3" });
    });
    expect(result.current.state).toEqual({ status: "error", code: "invalid_count", field: "offers" });
  });

  it("passes through local processing before a successful projection", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useReserveCapacityPlanner(), { wrapper });
    let pending!: Promise<void>;

    act(() => {
      pending = result.current.submit(normalRaw);
    });
    expect(result.current.state.status).toBe("loading");

    await act(async () => {
      await vi.runAllTimersAsync();
      await pending;
    });

    expect(result.current.state).toEqual({ status: "success", result: normalExpected });
  });

  it("keeps the projection when the selected network changes", async () => {
    const { result } = renderHook(
      () => ({ planner: useReserveCapacityPlanner(), network: useNetwork() }),
      { wrapper }
    );

    await act(async () => {
      await result.current.planner.submit(normalRaw);
    });

    const previous = result.current.planner.state;
    expect(previous.status).toBe("success");

    act(() => result.current.network.setNetwork("mainnet"));

    expect(result.current.network.network).toBe("mainnet");
    expect(result.current.planner.state).toBe(previous);
  });

  it("ignores a projection that reset cancelled", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useReserveCapacityPlanner(), { wrapper });
    let pending!: Promise<void>;

    act(() => {
      pending = result.current.submit(normalRaw);
    });
    expect(result.current.state.status).toBe("loading");

    act(() => result.current.reset());

    await act(async () => {
      await vi.runAllTimersAsync();
      await pending;
    });

    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("reports a negative starting balance", async () => {
    const { result } = renderHook(() => useReserveCapacityPlanner(), { wrapper });
    await act(async () => {
      await result.current.submit({ ...normalRaw, startingBalance: "-2" });
    });
    expect(result.current.state).toEqual({
      status: "error",
      code: "negative_starting_balance",
      field: "startingBalance"
    });
  });

  it("never stores a secret seed", async () => {
    const secret = "S".repeat(56);
    const { result } = renderHook(() => useReserveCapacityPlanner(), { wrapper });
    await act(async () => {
      await result.current.submit({ ...normalRaw, trustlines: secret });
    });
    expect(result.current.state).toEqual({ status: "error", code: "secret_rejected", field: "trustlines" });
    expect(JSON.stringify(result.current.state)).not.toContain(secret);
  });
});
