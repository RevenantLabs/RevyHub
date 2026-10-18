import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { useClaimableBalances } from "@/features/claimable-balances/hooks/useClaimableBalances";
import { handlers } from "@/features/claimable-balances/msw/handlers";
import {
  balanceId,
  claimantAccount,
  missingBalanceId
} from "@/features/claimable-balances/fixtures/claimableBalances.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useClaimableBalances", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useClaimableBalances(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports an error for empty account input", async () => {
    const { result } = renderHook(() => useClaimableBalances(), { wrapper });
    await act(async () => {
      await result.current.submit({ mode: "account", accountId: "", balanceId: "" });
    });
    await waitFor(() => expect(result.current.state.status).toBe("error"));
  });

  it("loads balances for a claimant account", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useClaimableBalances(), { wrapper });

    await act(async () => {
      await result.current.submit({
        mode: "account",
        accountId: claimantAccount,
        balanceId: ""
      });
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("loads a balance by ID", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useClaimableBalances(), { wrapper });

    await act(async () => {
      await result.current.submit({ mode: "balance", accountId: "", balanceId });
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("reports a missing balance ID", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useClaimableBalances(), { wrapper });

    await act(async () => {
      await result.current.submit({
        mode: "balance",
        accountId: "",
        balanceId: missingBalanceId
      });
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: "error",
        code: "balance_not_found",
        field: null
      })
    );
  });

  it("clears state on reset", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useClaimableBalances(), { wrapper });

    await act(async () => {
      await result.current.submit({
        mode: "account",
        accountId: claimantAccount,
        balanceId: ""
      });
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
