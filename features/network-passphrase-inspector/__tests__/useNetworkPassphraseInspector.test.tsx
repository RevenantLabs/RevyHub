import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNetworkPassphraseInspector } from "@/features/network-passphrase-inspector/hooks/useNetworkPassphraseInspector";

describe("useNetworkPassphraseInspector", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => useNetworkPassphraseInspector());
    expect(result.current.state.status).toBe("idle");
  });

  it("returns results for valid search", () => {
    const { result } = renderHook(() => useNetworkPassphraseInspector());
    act(() => result.current.search("mainnet"));
    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.results.length).toBeGreaterThan(0);
    }
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useNetworkPassphraseInspector());
    act(() => result.current.search(""));
    act(() => result.current.reset());
    expect(result.current.state.status).toBe("idle");
  });
});
