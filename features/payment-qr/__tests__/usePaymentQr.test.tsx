import { describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePaymentQr } from "@/features/payment-qr/hooks/usePaymentQr";
import {
  issuedForm,
  memoOverByteLimit,
  nativeForm
} from "@/features/payment-qr/fixtures/paymentQr.fixture";

describe("usePaymentQr", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => usePaymentQr());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("produces a URI and an SVG for a valid native request", async () => {
    const { result } = renderHook(() => usePaymentQr());

    await act(async () => {
      await result.current.submit(nativeForm);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    if (result.current.state.status !== "success") return;
    expect(result.current.state.result.uri).toContain("web+stellar:pay?");
    expect(result.current.state.result.svg).toContain("<svg");
  });

  it("carries the issued asset through to the request", async () => {
    const { result } = renderHook(() => usePaymentQr());

    await act(async () => {
      await result.current.submit(issuedForm);
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(result.current.state).toMatchObject({
      request: { asset: { kind: "issued", code: "USDC" } }
    });
  });

  it("reports the field responsible for a validation failure", async () => {
    const { result } = renderHook(() => usePaymentQr());

    await act(async () => {
      await result.current.submit({ ...nativeForm, memo: memoOverByteLimit });
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "memo_too_long",
      field: "memo"
    });
  });

  it("clears the result on reset", async () => {
    const { result } = renderHook(() => usePaymentQr());

    await act(async () => {
      await result.current.submit(nativeForm);
    });
    await waitFor(() => expect(result.current.state.status).toBe("success"));

    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
