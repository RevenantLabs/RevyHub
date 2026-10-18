import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAddressValidator } from "@/features/address-validator/hooks/useAddressValidator";
import {
  secretSeed,
  truncatedPublicKey,
  validPublicKey
} from "@/features/address-validator/fixtures/addressValidator.fixture";

describe("useAddressValidator", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useAddressValidator());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("moves to a result state for a valid address", () => {
    const { result } = renderHook(() => useAddressValidator());

    act(() => result.current.submit(validPublicKey));

    expect(result.current.state.status).toBe("result");
    expect(result.current.state).toMatchObject({
      result: { valid: true, address: validPublicKey }
    });
  });

  it("surfaces the specific failure code", () => {
    const { result } = renderHook(() => useAddressValidator());

    act(() => result.current.submit(truncatedPublicKey));

    expect(result.current.state).toEqual({
      status: "error",
      code: "bad_checksum_or_length"
    });
  });

  it("never carries a secret seed into state", () => {
    const { result } = renderHook(() => useAddressValidator());

    act(() => result.current.submit(secretSeed));

    expect(result.current.state).toEqual({ status: "error", code: "secret_seed_rejected" });
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useAddressValidator());

    act(() => result.current.submit(validPublicKey));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
