import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { useSep24TransactionStatusTracker } from "@/features/sep24-transaction-status-tracker/hooks/useSep24TransactionStatusTracker";
import { handlers } from "@/features/sep24-transaction-status-tracker/msw/handlers";
import {
  homeDomain,
  liveToken,
  transactionId
} from "@/features/sep24-transaction-status-tracker/fixtures/sep24TransactionStatusTracker.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

const valid = { homeDomain, transactionId, token: liveToken };

describe("useSep24TransactionStatusTracker", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useSep24TransactionStatusTracker(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("loads a pending deposit", async () => {
    const { result } = renderHook(() => useSep24TransactionStatusTracker(), { wrapper });
    await act(async () => {
      await result.current.submit(valid);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("rejects a bad domain before fetching", async () => {
    const { result } = renderHook(() => useSep24TransactionStatusTracker(), { wrapper });
    await act(async () => {
      await result.current.submit({ ...valid, homeDomain: "not a domain" });
    });
    expect(result.current.state).toMatchObject({ status: "error", code: "invalid_home_domain" });
  });

  it("drops a result when the network changes", async () => {
    const { result } = renderHook(() => useSep24TransactionStatusTracker(), { wrapper });
    await act(async () => {
      await result.current.submit(valid);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    act(() => result.current.network.setNetwork("mainnet"));
    await waitFor(() => expect(result.current.state.status).toBe("idle"));
  });
});
