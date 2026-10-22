import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { useHorizonStreamSampler } from "@/features/horizon-stream-sampler/hooks/useHorizonStreamSampler";

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useHorizonStreamSampler", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useHorizonStreamSampler(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports invalid bounds for empty input", async () => {
    const { result } = renderHook(() => useHorizonStreamSampler(), { wrapper });
    await act(async () => {
      await result.current.submit("");
    });
    await waitFor(() => expect(result.current.state.status).toBe("error"));
    expect(result.current.state).toEqual({ status: "error", code: "invalid_sample_bound" });
  });
});
