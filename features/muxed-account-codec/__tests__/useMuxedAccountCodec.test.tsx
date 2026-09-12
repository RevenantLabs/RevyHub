import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useMuxedAccountCodec } from "@/features/muxed-account-codec/hooks/useMuxedAccountCodec";
import {
  largeId,
  muxedAddressLargeId,
  secretSeed,
  smallId,
  validBaseAddress1
} from "@/features/muxed-account-codec/fixtures/muxedAccountCodec.fixture";

describe("useMuxedAccountCodec", () => {
  it("starts in idle state", () => {
    const { result } = renderHook(() => useMuxedAccountCodec());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("decodes an M-address synchronously to success state", () => {
    const { result } = renderHook(() => useMuxedAccountCodec());

    act(() => {
      result.current.submit({
        mode: "decode",
        muxedAddress: muxedAddressLargeId
      });
    });

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status !== "success") return;
    expect(result.current.state.result.baseAddress).toBe(validBaseAddress1);
    expect(result.current.state.result.id).toBe(largeId);
  });

  it("encodes a G-address and ID to success state", () => {
    const { result } = renderHook(() => useMuxedAccountCodec());

    act(() => {
      result.current.submit({
        mode: "encode",
        baseAddress: validBaseAddress1,
        id: largeId
      });
    });

    expect(result.current.state.status).toBe("success");
    if (result.current.state.status !== "success") return;
    expect(result.current.state.result.muxedAddress).toBe(muxedAddressLargeId);
  });

  it("sets error status on empty input", () => {
    const { result } = renderHook(() => useMuxedAccountCodec());

    act(() => {
      result.current.submit({
        mode: "decode",
        muxedAddress: ""
      });
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "empty_input"
    });
  });

  it("sets error status on invalid base address without leaking secret key", () => {
    const { result } = renderHook(() => useMuxedAccountCodec());

    act(() => {
      result.current.submit({
        mode: "encode",
        baseAddress: secretSeed,
        id: smallId
      });
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "invalid_base_address"
    });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("sets error status on invalid ID", () => {
    const { result } = renderHook(() => useMuxedAccountCodec());

    act(() => {
      result.current.submit({
        mode: "encode",
        baseAddress: validBaseAddress1,
        id: "-5"
      });
    });

    expect(result.current.state).toEqual({
      status: "error",
      code: "invalid_id"
    });
  });

  it("resets state back to idle", () => {
    const { result } = renderHook(() => useMuxedAccountCodec());

    act(() => {
      result.current.submit({
        mode: "decode",
        muxedAddress: muxedAddressLargeId
      });
    });
    expect(result.current.state.status).toBe("success");

    act(() => {
      result.current.reset();
    });
    expect(result.current.state).toEqual({ status: "idle" });
  });
});
