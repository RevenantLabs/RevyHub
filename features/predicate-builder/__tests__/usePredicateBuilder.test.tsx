import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePredicateBuilder } from "@/features/predicate-builder/hooks/usePredicateBuilder";
import type { RawPredicateForm } from "@/features/predicate-builder/types";

describe("usePredicateBuilder", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => usePredicateBuilder());
    
    expect(result.current.state.status).toBe("idle");
  });

  it("transitions to encoding then success for valid predicate", async () => {
    const { result } = renderHook(() => usePredicateBuilder());
    
    const raw: RawPredicateForm = { type: "unconditional" };
    
    act(() => {
      result.current.submit(raw);
    });
    
    // Should briefly enter encoding state
    await waitFor(() => {
      expect(result.current.state.status).toBe("success");
    });
    
    if (result.current.state.status !== "success") return;
    expect(result.current.state.result.xdrBase64.length).toBeGreaterThan(0);
    expect(result.current.state.result.plainLanguage).toBeTruthy();
  });

  it("transitions to error for null input", async () => {
    const { result } = renderHook(() => usePredicateBuilder());
    
    act(() => {
      result.current.submit(null);
    });
    
    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
    });
    
    if (result.current.state.status !== "error") return;
    expect(result.current.state.code).toBe("empty_predicate");
  });

  it("transitions to error for invalid timestamp", async () => {
    const { result } = renderHook(() => usePredicateBuilder());
    
    const raw: RawPredicateForm = {
      type: "before_absolute",
      timestamp: "invalid"
    };
    
    act(() => {
      result.current.submit(raw);
    });
    
    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
    });
    
    if (result.current.state.status !== "error") return;
    expect(result.current.state.code).toBe("invalid_timestamp");
    expect(result.current.state.field).toBe("timestamp");
  });

  it("transitions to error for AND with insufficient children", async () => {
    const { result } = renderHook(() => usePredicateBuilder());
    
    const raw: RawPredicateForm = {
      type: "and",
      children: [{ type: "unconditional" }]
    };
    
    act(() => {
      result.current.submit(raw);
    });
    
    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
    });
    
    if (result.current.state.status !== "error") return;
    expect(result.current.state.code).toBe("invalid_and_children");
  });

  it("resets to idle state", async () => {
    const { result } = renderHook(() => usePredicateBuilder());
    
    const raw: RawPredicateForm = { type: "unconditional" };
    
    act(() => {
      result.current.submit(raw);
    });
    
    await waitFor(() => {
      expect(result.current.state.status).toBe("success");
    });
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.state.status).toBe("idle");
  });

  it("encodes complex nested predicates", async () => {
    const { result } = renderHook(() => usePredicateBuilder());
    
    const raw: RawPredicateForm = {
      type: "and",
      children: [
        { type: "before_absolute", timestamp: "2027-01-01T00:00:00Z" },
        {
          type: "or",
          children: [
            { type: "unconditional" },
            {
              type: "not",
              child: { type: "before_relative", seconds: "86400" }
            }
          ]
        }
      ]
    };
    
    act(() => {
      result.current.submit(raw);
    });
    
    await waitFor(() => {
      expect(result.current.state.status).toBe("success");
    });
    
    if (result.current.state.status !== "success") return;
    expect(result.current.state.result.xdrBase64.length).toBeGreaterThan(0);
    expect(result.current.state.result.plainLanguage).toContain("AND");
    expect(result.current.state.result.plainLanguage).toContain("OR");
    expect(result.current.state.result.plainLanguage).toContain("NOT");
  });
});
