import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useHorizonPaginationInspector } from "@/features/horizon-pagination-inspector/hooks/useHorizonPaginationInspector";
import {
  emptyRecordsCollectionJson,
  malformedJson,
  nonCollectionJson,
  secretSeed,
  validCollectionJson
} from "@/features/horizon-pagination-inspector/fixtures/horizonPaginationInspector.fixture";

describe("useHorizonPaginationInspector", () => {
  it("starts idle with zero redactions", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());
    expect(result.current.state).toEqual({ status: "idle" });
    expect(result.current.redactions).toBe(0);
  });

  it("successfully inspects a valid collection", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());

    act(() => {
      result.current.submit({
        collection: validCollectionJson,
        expectedOrigin: ""
      });
    });

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.report.recordCount).toBe(3);
    }
  });

  it("handles empty records collection as valid success", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());

    act(() => {
      result.current.submit({
        collection: emptyRecordsCollectionJson,
        expectedOrigin: ""
      });
    });

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status === "success") {
      expect(result.current.state.report.recordCount).toBe(0);
    }
  });

  it("transitions to error on empty input", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());

    act(() => {
      result.current.submit({
        collection: "   ",
        expectedOrigin: ""
      });
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "empty_input"
    });
  });

  it("transitions to error on malformed JSON", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());

    act(() => {
      result.current.submit({
        collection: malformedJson,
        expectedOrigin: ""
      });
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "invalid_json"
    });
  });

  it("transitions to error on non-collection payload", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());

    act(() => {
      result.current.submit({
        collection: nonCollectionJson,
        expectedOrigin: ""
      });
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "invalid_collection"
    });
  });

  it("never keeps a pasted secret key in hook state and increments redactions", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());

    act(() => {
      result.current.submit({
        collection: `{"secret":"${secretSeed}"}`,
        expectedOrigin: ""
      });
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "invalid_input"
    });
    expect(result.current.redactions).toBe(1);
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("clears stale success state when subsequent submission fails", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());

    act(() => {
      result.current.submit({
        collection: validCollectionJson,
        expectedOrigin: ""
      });
    });
    expect(result.current.state.status).toBe("success");

    act(() => {
      result.current.submit({
        collection: malformedJson,
        expectedOrigin: ""
      });
    });
    expect(result.current.state.status).toBe("error");
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());

    act(() => {
      result.current.submit({
        collection: validCollectionJson,
        expectedOrigin: ""
      });
    });
    expect(result.current.state.status).toBe("success");

    act(() => {
      result.current.reset();
    });
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
