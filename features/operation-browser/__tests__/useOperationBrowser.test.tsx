import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { useOperationBrowser } from "@/features/operation-browser/hooks/useOperationBrowser";
import { handlers } from "@/features/operation-browser/msw/handlers";
import {
  accountId,
  secretSeed
} from "@/features/operation-browser/fixtures/operationBrowser.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useOperationBrowser", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useOperationBrowser(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports an error for empty input", async () => {
    const { result } = renderHook(() => useOperationBrowser(), { wrapper });
    await act(async () => {
      await result.current.submit("");
    });
    await waitFor(() => expect(result.current.state.status).toBe("error"));
  });

  it("loads operations for a valid account", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useOperationBrowser(), { wrapper });
    await act(async () => {
      await result.current.submit(accountId);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    if (result.current.state.status !== "success") return;
    expect(result.current.state.result.pages[0]).toHaveLength(20);
  });

  it("never carries a secret seed into hook state", async () => {
    const { result } = renderHook(() => useOperationBrowser(), { wrapper });
    await act(async () => {
      await result.current.submit(secretSeed);
    });
    await waitFor(() => expect(result.current.state.status).toBe("error"));
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("loads an older page on demand", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useOperationBrowser(), { wrapper });
    await act(async () => {
      await result.current.submit(accountId);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    await act(async () => {
      await result.current.loadOlder();
    });
    await waitFor(() => {
      expect(result.current.state.status).toBe("success");
      if (result.current.state.status !== "success") return;
      expect(result.current.state.result.pageIndex).toBe(1);
    });
  });
});
