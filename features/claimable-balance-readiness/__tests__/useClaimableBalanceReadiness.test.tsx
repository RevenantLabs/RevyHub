import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { useClaimableBalanceReadiness } from "@/features/claimable-balance-readiness/hooks/useClaimableBalanceReadiness";
import { handlers } from "@/features/claimable-balance-readiness/msw/handlers";
import {
  balanceId,
  claimantAccount,
  evaluationTime,
  missingBalanceId
} from "@/features/claimable-balance-readiness/fixtures/claimableBalanceReadiness.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useClaimableBalanceReadiness", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useClaimableBalanceReadiness(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports invalid_balance_id for a bad balance ID", async () => {
    const { result } = renderHook(() => useClaimableBalanceReadiness(), { wrapper });
    await act(async () => {
      await result.current.submit({
        balanceId: "nope",
        claimant: claimantAccount,
        evaluationTime
      });
    });
    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: "error",
        code: "invalid_balance_id",
        field: "balanceId"
      })
    );
  });

  it("reports invalid_claimant for a bad address", async () => {
    const { result } = renderHook(() => useClaimableBalanceReadiness(), { wrapper });
    await act(async () => {
      await result.current.submit({
        balanceId,
        claimant: "bad",
        evaluationTime
      });
    });
    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: "error",
        code: "invalid_claimant",
        field: "claimant"
      })
    );
  });

  it("reports invalid_time for a local-only timestamp", async () => {
    const { result } = renderHook(() => useClaimableBalanceReadiness(), { wrapper });
    await act(async () => {
      await result.current.submit({
        balanceId,
        claimant: claimantAccount,
        evaluationTime: "2026-06-01T12:00:00"
      });
    });
    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: "error",
        code: "invalid_time",
        field: "evaluationTime"
      })
    );
  });

  it("loads readiness for a valid request", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useClaimableBalanceReadiness(), { wrapper });

    await act(async () => {
      await result.current.submit({
        balanceId,
        claimant: claimantAccount,
        evaluationTime
      });
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("reports a missing balance ID", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useClaimableBalanceReadiness(), { wrapper });

    await act(async () => {
      await result.current.submit({
        balanceId: missingBalanceId,
        claimant: claimantAccount,
        evaluationTime
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
    const { result } = renderHook(() => useClaimableBalanceReadiness(), { wrapper });

    await act(async () => {
      await result.current.submit({
        balanceId,
        claimant: claimantAccount,
        evaluationTime
      });
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
