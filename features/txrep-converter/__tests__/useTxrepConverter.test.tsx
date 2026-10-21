import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { useTxrepConverter } from "@/features/txrep-converter/hooks/useTxrepConverter";
import { sampleEnvelope } from "@/features/txrep-converter/fixtures/sample-envelope.fixture";

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useTxrepConverter", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useTxrepConverter(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("converts a pasted envelope", () => {
    const { result } = renderHook(() => useTxrepConverter(), { wrapper });
    act(() => result.current.submit(sampleEnvelope));
    expect(result.current.state.status).toBe("success");
  });

  it("rejects an empty paste", () => {
    const { result } = renderHook(() => useTxrepConverter(), { wrapper });
    act(() => result.current.submit("  "));
    expect(result.current.state).toEqual({ status: "error", code: "empty_input" });
  });

  it("drops a result when the network changes", async () => {
    const { result } = renderHook(() => useTxrepConverter(), { wrapper });
    act(() => result.current.submit(sampleEnvelope));
    expect(result.current.state.status).toBe("success");
    act(() => result.current.network.setNetwork("mainnet"));
    await waitFor(() => expect(result.current.state.status).toBe("idle"));
  });
});
