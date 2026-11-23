import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { horizonUrl } from "@/core/horizon/client";
import { withMswHandlers, http, HttpResponse, delay } from "@/core/testing/msw";
import { useTransactionSequenceGapAuditor } from "@/features/transaction-sequence-gap-auditor/hooks/useTransactionSequenceGapAuditor";
import { accountId, normalPage } from "@/features/transaction-sequence-gap-auditor/fixtures/normal.fixture";
import {
  handlers,
  rateLimitedHandler
} from "@/features/transaction-sequence-gap-auditor/msw/handlers";

const server = withMswHandlers(...handlers);
function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useTransactionSequenceGapAuditor", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useTransactionSequenceGapAuditor(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("moves through loading and success, then resets", async () => {
    const { result } = renderHook(() => useTransactionSequenceGapAuditor(), { wrapper });
    let request: Promise<void>;
    await act(async () => {
      request = result.current.submit({ accountId });
      await Promise.resolve();
    });
    await act(async () => request);
    expect(result.current.state.status).toBe("success");
    act(() => result.current.reset());
    expect(result.current.state.status).toBe("idle");
  });

  it("surfaces validation and Horizon errors", async () => {
    const { result } = renderHook(() => useTransactionSequenceGapAuditor(), { wrapper });
    await act(async () => result.current.submit({ accountId: "" }));
    expect(result.current.state).toEqual({ status: "error", code: "invalid_input" });
    server.use(rateLimitedHandler);
    await act(async () => result.current.submit({ accountId }));
    expect(result.current.state).toEqual({ status: "error", code: "rate_limited" });
  });

  it("rejects stale completions and clears state on network change", async () => {
    server.use(
      http.get(horizonUrl("testnet", `/accounts/${accountId}/transactions`), async () => {
        await delay(30);
        return HttpResponse.json(normalPage);
      })
    );
    const { result } = renderHook(
      () => ({ auditor: useTransactionSequenceGapAuditor(), network: useNetwork() }),
      { wrapper }
    );
    await act(async () => {
      void result.current.auditor.submit({ accountId });
      await result.current.auditor.submit({ accountId: "" });
    });
    await waitFor(() =>
      expect(result.current.auditor.state).toEqual({ status: "error", code: "invalid_input" })
    );
    act(() => result.current.network.setNetwork("mainnet"));
    expect(result.current.auditor.state.status).toBe("idle");
  });
});
