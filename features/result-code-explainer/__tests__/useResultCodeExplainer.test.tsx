import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useResultCodeExplainer } from "@/features/result-code-explainer/hooks/useResultCodeExplainer";
import {
  failedPaymentResultXdr,
  notBase64
} from "@/features/result-code-explainer/fixtures/resultCodeExplainer.fixture";

describe("useResultCodeExplainer", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useResultCodeExplainer());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("explains a pasted code synchronously", () => {
    const { result } = renderHook(() => useResultCodeExplainer());

    act(() => result.current.submit({ mode: "code", value: "tx_bad_seq", search: "" }));

    expect(result.current.state.status).toBe("success");
    expect(result.current.state).toMatchObject({
      result: { explanations: [{ code: "tx_bad_seq", known: true }] }
    });
  });

  it("decodes a result XDR", () => {
    const { result } = renderHook(() => useResultCodeExplainer());

    act(() => result.current.submit({ mode: "xdr", value: failedPaymentResultXdr, search: "" }));

    expect(result.current.state).toMatchObject({
      status: "success",
      result: { transactionCode: "tx_failed" }
    });
  });

  it("separates invalid base64 from invalid XDR", () => {
    const { result } = renderHook(() => useResultCodeExplainer());

    act(() => result.current.submit({ mode: "xdr", value: notBase64, search: "" }));
    expect(result.current.state).toEqual({ status: "error", code: "invalid_base64" });

    act(() => result.current.submit({ mode: "xdr", value: "AAAA", search: "" }));
    expect(result.current.state).toEqual({ status: "error", code: "invalid_xdr" });
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useResultCodeExplainer());

    act(() => result.current.submit({ mode: "code", value: "tx_failed", search: "" }));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
