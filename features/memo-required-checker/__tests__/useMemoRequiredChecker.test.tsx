import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { useMemoRequiredChecker } from "@/features/memo-required-checker/hooks/useMemoRequiredChecker";
import { handlers } from "@/features/memo-required-checker/msw/handlers";
import { accountId } from "@/features/memo-required-checker/fixtures/memoRequiredChecker.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useMemoRequiredChecker", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useMemoRequiredChecker(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("loads a memo-required account", async () => {
    const { result } = renderHook(() => useMemoRequiredChecker(), { wrapper });
    await act(async () => {
      await result.current.submit({ accountId });
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("rejects an invalid account before fetching", async () => {
    const { result } = renderHook(() => useMemoRequiredChecker(), { wrapper });
    await act(async () => {
      await result.current.submit({ accountId: "" });
    });
    expect(result.current.state).toMatchObject({ status: "error", code: "invalid_account", field: "accountId" });
  });

  it("drops a result when the network changes", async () => {
    const { result } = renderHook(() => useMemoRequiredChecker(), { wrapper });
    await act(async () => {
      await result.current.submit({ accountId });
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    act(() => result.current.network.setNetwork("mainnet"));
    await waitFor(() => expect(result.current.state.status).toBe("idle"));
  });
});
