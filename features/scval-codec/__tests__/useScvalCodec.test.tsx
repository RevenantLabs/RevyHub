import { describe, expect, it } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { useScvalCodec } from "@/features/scval-codec/hooks/useScvalCodec";

function wrapper({ children }: { children: React.ReactNode }) {
  return <NetworkProvider initialNetwork="testnet">{children}</NetworkProvider>;
}

describe("useScvalCodec", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useScvalCodec(), { wrapper });
    expect(result.current.state.status).toBe("idle");
  });

  it("reports an error for empty input", async () => {
    const { result } = renderHook(() => useScvalCodec(), { wrapper });
    await act(async () => {
      await result.current.submit("", "decode");
    });
    await waitFor(() => expect(result.current.state.status).toBe("error"));
  });
});
