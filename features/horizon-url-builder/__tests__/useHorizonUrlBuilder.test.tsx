import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHorizonUrlBuilder } from "@/features/horizon-url-builder/hooks/useHorizonUrlBuilder";

describe("useHorizonUrlBuilder", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => useHorizonUrlBuilder());
    expect(result.current.state.status).toBe("idle");
  });

  it("builds URL for valid config", () => {
    const { result } = renderHook(() => useHorizonUrlBuilder());
    act(() => result.current.build({ resource: "accounts", network: "mainnet", limit: 20 }));
    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.result.url).toContain("horizon.stellar.org");
    }
  });

  it("returns error for invalid config", () => {
    const { result } = renderHook(() => useHorizonUrlBuilder());
    act(() => result.current.build({ resource: "invalid" as any, network: "mainnet" }));
    expect(result.current.state.status).toBe("error");
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useHorizonUrlBuilder());
    act(() => result.current.build({ resource: "accounts", network: "mainnet" }));
    act(() => result.current.reset());
    expect(result.current.state.status).toBe("idle");
  });
});
