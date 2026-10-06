import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useHorizonPaginationInspector } from "@/features/horizon-pagination-inspector/hooks/useHorizonPaginationInspector";
import {
  completePageJson,
  duplicateTokensJson,
  notJson,
  pagingToken,
  shortPageWithNextJson
} from "@/features/horizon-pagination-inspector/fixtures/horizonPaginationInspector.fixture";

describe("useHorizonPaginationInspector", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("reports a successful inspection", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());

    act(() => result.current.submit(completePageJson));

    expect(result.current.state.status).toBe("success");
    expect(result.current.state).toMatchObject({
      inspection: { recordCount: 3, tokenOrder: "increasing" }
    });
  });

  it("surfaces a parsed-but-invalid document as an error code, not a throw", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());

    act(() => result.current.submit(notJson));

    expect(result.current.state).toEqual({ status: "error", code: "not_json" });
  });

  it("moves between success and error without getting stuck", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());

    act(() => result.current.submit(notJson));
    expect(result.current.state).toEqual({ status: "error", code: "not_json" });

    act(() => result.current.submit(completePageJson));
    expect(result.current.state.status).toBe("success");

    act(() => result.current.submit(duplicateTokensJson));
    expect(result.current.state).toMatchObject({
      inspection: { duplicates: [{ key: pagingToken(0), indexes: [0, 1] }] }
    });
  });

  it("never reports a short page as empty of further pages", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());

    act(() => result.current.submit(shortPageWithNextJson));

    expect(result.current.state).toMatchObject({
      inspection: { recordCount: 1 }
    });
    expect(
      result.current.state.status === "success" && result.current.state.inspection.next !== null
    ).toBe(true);
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useHorizonPaginationInspector());

    act(() => result.current.submit(completePageJson));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
