import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSep12KycReference } from "@/features/sep12-kyc-reference/hooks/useSep12KycReference";

describe("useSep12KycReference", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => useSep12KycReference());
    expect(result.current.state.status).toBe("idle");
  });

  it("returns results for valid search", () => {
    const { result } = renderHook(() => useSep12KycReference());
    act(() => result.current.search("first_name"));
    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.results.length).toBe(1);
    }
  });

  it("returns all fields for empty query", () => {
    const { result } = renderHook(() => useSep12KycReference());
    act(() => result.current.search(""));
    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.results.length).toBeGreaterThan(10);
    }
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useSep12KycReference());
    act(() => result.current.search("test"));
    act(() => result.current.reset());
    expect(result.current.state.status).toBe("idle");
  });
});
