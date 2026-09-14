import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAccountOffersInspector } from "@/features/account-offers-inspector/hooks/useAccountOffersInspector";

describe("useAccountOffersInspector", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => useAccountOffersInspector());
    expect(result.current.state.status).toBe("idle");
  });

  it("exports the hook function", () => {
    expect(typeof useAccountOffersInspector).toBe("function");
  });
});
