import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { useSigningPayloadInspector } from "@/features/signing-payload-inspector/hooks/useSigningPayloadInspector";
import { classicXdr } from "@/features/signing-payload-inspector/fixtures/classic-envelope.fixture";

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useSigningPayloadInspector", () => {
  it("starts idle on testnet, shows loading, then succeeds", async () => {
    const { result } = renderHook(() => useSigningPayloadInspector(), { wrapper });
    expect(result.current.state).toEqual({ status: "idle" });
    expect(result.current.selectedNetwork).toBe("testnet");
    act(() => result.current.submit(classicXdr));
    expect(result.current.state.status).toBe("loading");
    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });
  it("reports validation errors and allows a retry", async () => {
    const { result } = renderHook(() => useSigningPayloadInspector(), { wrapper });
    act(() => result.current.submit(""));
    await waitFor(() => expect(result.current.state).toEqual({ status: "error", code: "empty_xdr" }));
    act(() => result.current.submit(classicXdr));
    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });
  it("clears a stale result on network change and recomputes for mainnet", async () => {
    const { result } = renderHook(() => useSigningPayloadInspector(), { wrapper });
    act(() => result.current.submit(classicXdr));
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    const oldHash = result.current.state.status === "success" ? result.current.state.result.outer.payloadHashHex : "";
    act(() => result.current.changeNetwork("mainnet"));
    expect(result.current.state).toEqual({ status: "idle" });
    act(() => result.current.submit(classicXdr));
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    if (result.current.state.status === "success") {
      expect(result.current.state.result.network).toBe("mainnet");
      expect(result.current.state.result.outer.payloadHashHex).not.toBe(oldHash);
    }
  });
  it("invalidates pending work when reset", async () => {
    const { result } = renderHook(() => useSigningPayloadInspector(), { wrapper });
    act(() => {
      result.current.submit(classicXdr);
      result.current.reset();
    });
    await act(async () => { await Promise.resolve(); });
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
