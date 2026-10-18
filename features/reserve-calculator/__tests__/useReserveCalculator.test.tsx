import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { resetHorizonClients } from "@/core/horizon/client";
import { withMswHandlers } from "@/core/testing/msw";
import { useReserveCalculator } from "@/features/reserve-calculator/hooks/useReserveCalculator";
import { handlers } from "@/features/reserve-calculator/msw/handlers";
import {
  accountId,
  unknownAccountId
} from "@/features/reserve-calculator/fixtures/reserveCalculator.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useReserveCalculator", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useReserveCalculator(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports an error for empty input", async () => {
    const { result } = renderHook(() => useReserveCalculator(), { wrapper });
    await act(async () => {
      await result.current.submit("");
    });
    expect(result.current.state).toEqual({ status: "error", code: "empty_input" });
  });

  it("transitions through loading to a successful calculation", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useReserveCalculator(), { wrapper });
    let request!: Promise<void>;

    act(() => {
      request = result.current.submit(accountId);
    });
    expect(result.current.state).toEqual({ status: "loading" });

    await act(async () => request);
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(result.current.state).toMatchObject({
      data: { minimumBalance: "3.0000000", spendableBalance: "7.7500000" }
    });
  });

  it("reports a missing account", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useReserveCalculator(), { wrapper });

    await act(async () => {
      await result.current.submit(unknownAccountId);
    });

    expect(result.current.state).toEqual({ status: "error", code: "account_not_found" });
  });

  it("never carries a submitted secret seed into state", async () => {
    const secret = "S".repeat(56);
    const { result } = renderHook(() => useReserveCalculator(), { wrapper });

    await act(async () => {
      await result.current.submit(secret);
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_address" });
    expect(JSON.stringify(result.current.state)).not.toContain(secret);
  });

  it("returns to idle when reset", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useReserveCalculator(), { wrapper });
    await act(async () => {
      await result.current.submit(accountId);
    });

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
