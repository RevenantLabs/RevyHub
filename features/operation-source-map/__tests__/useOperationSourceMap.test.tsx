import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useOperationSourceMap } from "@/features/operation-source-map/hooks/useOperationSourceMap";
import {
  feeBumpXdr,
  mixedOverridesXdr,
  noOverridesXdr,
  notBase64,
  secretSeed
} from "@/features/operation-source-map/fixtures/operationSourceMap.fixture";

describe("useOperationSourceMap", () => {
  it("starts idle with no filter applied", () => {
    const { result } = renderHook(() => useOperationSourceMap());

    expect(result.current.state).toEqual({ status: "idle" });
    expect(result.current.filter).toBe("all");
    expect(result.current.visibleOperations).toEqual([]);
  });

  it("maps a valid envelope", () => {
    const { result } = renderHook(() => useOperationSourceMap());

    act(() => result.current.submit(mixedOverridesXdr));

    expect(result.current.state.status).toBe("success");
    expect(result.current.visibleOperations).toHaveLength(3);
  });

  it("narrows the visible rows when the filter changes", () => {
    const { result } = renderHook(() => useOperationSourceMap());

    act(() => result.current.submit(mixedOverridesXdr));
    act(() => result.current.setFilter("overridden"));

    expect(result.current.visibleOperations).toHaveLength(1);
    expect(result.current.visibleOperations[0].inherited).toBe(false);

    act(() => result.current.setFilter("inherited"));
    expect(result.current.visibleOperations).toHaveLength(2);
  });

  it("leaves the underlying map untouched while filtering", () => {
    const { result } = renderHook(() => useOperationSourceMap());

    act(() => result.current.submit(mixedOverridesXdr));
    act(() => result.current.setFilter("overridden"));

    // The filter is a view, not a mutation.
    expect(
      result.current.state.status === "success" && result.current.state.map.operations
    ).toHaveLength(3);
  });

  it("can produce an empty view, and reset back out of it", () => {
    const { result } = renderHook(() => useOperationSourceMap());

    act(() => result.current.submit(noOverridesXdr));
    act(() => result.current.setFilter("overridden"));
    expect(result.current.visibleOperations).toEqual([]);

    act(() => result.current.resetFilter());
    expect(result.current.filter).toBe("all");
    expect(result.current.visibleOperations).toHaveLength(2);
  });

  it("clears a stale filter when a new envelope is submitted", () => {
    const { result } = renderHook(() => useOperationSourceMap());

    act(() => result.current.submit(mixedOverridesXdr));
    act(() => result.current.setFilter("overridden"));

    act(() => result.current.submit(noOverridesXdr));

    // Carrying the filter over would show an empty table for a map that has
    // two perfectly good rows in it.
    expect(result.current.filter).toBe("all");
    expect(result.current.visibleOperations).toHaveLength(2);
  });

  it("recognises a fee bump and keeps the fee payer aside", () => {
    const { result } = renderHook(() => useOperationSourceMap());

    act(() => result.current.submit(feeBumpXdr));

    expect(result.current.state).toMatchObject({ map: { kind: "fee-bump" } });
    expect(
      result.current.state.status === "success" && result.current.state.map.feePayer
    ).not.toBeNull();
  });

  it("clears a stale result when the next submission fails", () => {
    const { result } = renderHook(() => useOperationSourceMap());

    act(() => result.current.submit(mixedOverridesXdr));
    expect(result.current.state.status).toBe("success");

    act(() => result.current.submit(notBase64));
    expect(result.current.state).toEqual({ status: "error", code: "invalid_input" });
    expect(result.current.visibleOperations).toEqual([]);
  });

  it("never keeps a pasted secret in hook state, and asks for a redaction", () => {
    const { result } = renderHook(() => useOperationSourceMap());

    expect(result.current.redactions).toBe(0);

    act(() => result.current.submit(secretSeed));

    expect(result.current.state).toEqual({ status: "error", code: "invalid_input" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
    expect(result.current.redactions).toBe(1);
  });

  it("does not redact the field for an ordinary bad paste", () => {
    const { result } = renderHook(() => useOperationSourceMap());

    act(() => result.current.submit(notBase64));

    expect(result.current.state).toEqual({ status: "error", code: "invalid_input" });
    expect(result.current.redactions).toBe(0);
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useOperationSourceMap());

    act(() => result.current.submit(mixedOverridesXdr));
    act(() => result.current.setFilter("inherited"));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
    expect(result.current.filter).toBe("all");
  });
});
