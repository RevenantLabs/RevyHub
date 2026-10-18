import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { useTransactionFeeChargeAudit } from "@/features/transaction-fee-charge-audit/hooks/useTransactionFeeChargeAudit";
import { handlers } from "@/features/transaction-fee-charge-audit/msw/handlers";
import {
  classicHash,
  missingHash
} from "@/features/transaction-fee-charge-audit/fixtures/transactionFeeChargeAudit.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useTransactionFeeChargeAudit", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useTransactionFeeChargeAudit(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("loads a classic fee audit", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useTransactionFeeChargeAudit(), { wrapper });

    await act(async () => {
      await result.current.submit(classicHash);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    if (result.current.state.status !== "success") return;
    expect(result.current.state.result.envelope.kind).toBe("classic");
  });

  it("rejects a malformed hash without a request", async () => {
    const { result } = renderHook(() => useTransactionFeeChargeAudit(), { wrapper });

    await act(async () => {
      await result.current.submit("not-a-hash");
    });

    expect(result.current.state).toEqual({ status: "error", code: "invalid_hash" });
  });

  it("reports a hash that does not exist", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useTransactionFeeChargeAudit(), { wrapper });

    await act(async () => {
      await result.current.submit(missingHash);
    });

    await waitFor(() =>
      expect(result.current.state).toEqual({ status: "error", code: "transaction_not_found" })
    );
  });

  it("clears state on reset", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useTransactionFeeChargeAudit(), { wrapper });

    await act(async () => {
      await result.current.submit(classicHash);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
