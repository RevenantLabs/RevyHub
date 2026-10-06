import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSep12Fields } from "@/features/sep12-fields/hooks/useSep12Fields";
import { MAX_QUERY_LENGTH } from "@/features/sep12-fields/schema";
import { SEP9_FIELDS } from "@/features/sep12-fields/lib/sep12Fields";

describe("useSep12Fields", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useSep12Fields());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("lists the whole set for an empty search", () => {
    const { result } = renderHook(() => useSep12Fields());

    act(() => result.current.submit(""));

    expect(result.current.state).toMatchObject({
      result: { matchedFields: SEP9_FIELDS.length }
    });
  });

  it("finds a field by canonical name", () => {
    const { result } = renderHook(() => useSep12Fields());

    act(() => result.current.submit("first_name"));

    expect(result.current.state.status).toBe("success");
    expect(result.current.state).toMatchObject({
      result: { matchedFields: 1 }
    });
  });

  it("reports an oversized search as an error code, not a throw", () => {
    const { result } = renderHook(() => useSep12Fields());

    act(() => result.current.submit("x".repeat(MAX_QUERY_LENGTH + 1)));

    expect(result.current.state).toEqual({ status: "error", code: "query_too_long" });
  });

  it("recovers from an error on the next search", () => {
    const { result } = renderHook(() => useSep12Fields());

    act(() => result.current.submit("x".repeat(MAX_QUERY_LENGTH + 1)));
    expect(result.current.state.status).toBe("error");

    act(() => result.current.submit("first_name"));
    expect(result.current.state.status).toBe("success");
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useSep12Fields());

    act(() => result.current.submit("first_name"));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
