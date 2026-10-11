import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHorizonPaginationInspector } from "@/features/horizon-pagination-inspector/hooks/useHorizonPaginationInspector";

describe("useHorizonPaginationInspector", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());
    expect(result.current.state.status).toBe("idle");
  });

  it("parses valid JSON response", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());
    act(() => result.current.inspect('{"_embedded":{"records":[{"id":"1"}]}}'));
    expect(result.current.state.status).toBe("success");
  });

  it("returns error for empty input", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());
    act(() => result.current.inspect(""));
    expect(result.current.state.status).toBe("error");
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());
    act(() => result.current.inspect('{"_embedded":{"records":[]}}'));
    act(() => result.current.reset());
    expect(result.current.state.status).toBe("idle");
  });
});
