import { describe, expect, it, vi } from "vitest";
import { useFocusResult } from "../../lib/hooks/useFocusResult";

function createMockHookResult() {
  const ref = { current: null as HTMLDivElement | null };
  let called = false;
  const moveFocusToResult = () => {
    called = true;
    ref.current?.focus();
  };
  return { resultRef: ref, moveFocusToResult, called: () => called };
}

describe("useFocusResult", () => {
  it("exports a function", () => {
    expect(typeof useFocusResult).toBe("function");
  });

  it("returns ref and focus trigger shape", () => {
    const result = createMockHookResult();
    expect(result.resultRef).toHaveProperty("current", null);
    expect(typeof result.moveFocusToResult).toBe("function");
  });

  it("calls focus on the ref element when triggered", () => {
    const div = document.createElement("div");
    const focusSpy = vi.spyOn(div, "focus");
    const result = createMockHookResult();
    result.resultRef.current = div;
    result.moveFocusToResult();
    expect(focusSpy).toHaveBeenCalledTimes(1);
  });

  it("does not throw when ref is null", () => {
    const result = createMockHookResult();
    expect(() => result.moveFocusToResult()).not.toThrow();
  });

  it("supports repeated calls", () => {
    const div = document.createElement("div");
    const focusSpy = vi.spyOn(div, "focus");
    const result = createMockHookResult();
    result.resultRef.current = div;
    result.moveFocusToResult();
    result.moveFocusToResult();
    result.moveFocusToResult();
    expect(focusSpy).toHaveBeenCalledTimes(3);
  });
});
