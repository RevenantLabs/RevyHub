import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { useRegulatedAssetInspector } from "@/features/regulated-asset-inspector/hooks/useRegulatedAssetInspector";
import { handlers } from "@/features/regulated-asset-inspector/msw/handlers";
import { issuerId } from "@/features/regulated-asset-inspector/fixtures/regulatedAssetInspector.fixture";

withMswHandlers(...handlers);

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

const valid = { issuerId, assetCode: "USDC" };

describe("useRegulatedAssetInspector", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useRegulatedAssetInspector(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("loads a regulated asset", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useRegulatedAssetInspector(), { wrapper });
    await act(async () => {
      await result.current.submit(valid);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("rejects an invalid account before fetching", async () => {
    const { result } = renderHook(() => useRegulatedAssetInspector(), { wrapper });
    await act(async () => {
      await result.current.submit({ issuerId: "", assetCode: "USDC" });
    });
    expect(result.current.state).toMatchObject({ status: "error", code: "invalid_account" });
  });

  it("drops a result when the network changes", async () => {
    resetHorizonClients();
    const { result } = renderHook(() => useRegulatedAssetInspector(), { wrapper });
    await act(async () => {
      await result.current.submit(valid);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    act(() => result.current.network.setNetwork("mainnet"));
    await waitFor(() => expect(result.current.state.status).toBe("idle"));
  });
});
