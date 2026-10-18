import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider, useNetwork } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { useMultiAccountAssetExposure } from "../hooks/useMultiAccountAssetExposure";
import { accountA, accountB } from "../fixtures/multiAccountAssetExposure.fixture";
import { handlers } from "../msw/handlers";
withMswHandlers(...handlers);
function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}
describe("exposure hook", () => {
  it("moves from idle through loading to success", async () => {
    const { result } = renderHook(() => useMultiAccountAssetExposure(), { wrapper });
    expect(result.current.state.status).toBe("idle");
    let pending: Promise<void>;
    act(() => { pending = result.current.submit(`${accountA}\n${accountB}`); });
    expect(result.current.state.status).toBe("loading");
    await act(async () => { await pending; });
    expect(result.current.state.status).toBe("success");
  });
  it("reports invalid input without storing a seed", async () => {
    const { result } = renderHook(() => useMultiAccountAssetExposure(), { wrapper });
    await act(async () => { await result.current.submit("SNOTASEED"); });
    expect(result.current.state).toEqual({ status: "error", code: "invalid_account" });
    expect(JSON.stringify(result.current.state)).not.toContain("SNOTASEED");
  });
  it("hides results immediately after a network change", async () => {
    const { result } = renderHook(() => ({ exposure: useMultiAccountAssetExposure(), network: useNetwork() }), { wrapper });
    await act(async () => { await result.current.exposure.submit(`${accountA}\n${accountB}`); });
    await waitFor(() => expect(result.current.exposure.state.status).toBe("success"));
    act(() => result.current.network.setNetwork("mainnet"));
    expect(result.current.exposure.state.status).toBe("idle");
  });
});
