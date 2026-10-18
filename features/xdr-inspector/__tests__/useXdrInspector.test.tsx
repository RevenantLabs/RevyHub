import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useXdrInspector } from "@/features/xdr-inspector/hooks/useXdrInspector";
import {
  feeBumpXdr,
  notBase64,
  paymentXdr
} from "@/features/xdr-inspector/fixtures/xdrInspector.fixture";

describe("useXdrInspector", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useXdrInspector());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("summarises a valid envelope", () => {
    const { result } = renderHook(() => useXdrInspector());

    act(() => result.current.submit(paymentXdr));

    expect(result.current.state.status).toBe("success");
    expect(result.current.state).toMatchObject({ summary: { variant: "classic-v1" } });
  });

  it("recognises a fee bump", () => {
    const { result } = renderHook(() => useXdrInspector());

    act(() => result.current.submit(feeBumpXdr));

    expect(result.current.state).toMatchObject({ summary: { variant: "fee-bump" } });
  });

  it("separates a bad paste from a bad envelope", () => {
    const { result } = renderHook(() => useXdrInspector());

    act(() => result.current.submit(notBase64));
    expect(result.current.state).toEqual({ status: "error", code: "invalid_base64" });

    act(() => result.current.submit("AAAAAAAA"));
    expect(result.current.state).toEqual({ status: "error", code: "malformed_envelope" });
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useXdrInspector());

    act(() => result.current.submit(paymentXdr));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
