import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useBatchAddressValidator } from "@/features/batch-address-validator/hooks/useBatchAddressValidator";
import {
  batchAddressValidatorFixture,
  mixedAddressList,
  newlineSeparatedInput,
  secretSeed,
  secretSeedList
} from "@/features/batch-address-validator/fixtures/batchAddressValidator.fixture";
import { validPublicKey } from "@/features/address-validator/fixtures/addressValidator.fixture";

describe("useBatchAddressValidator", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useBatchAddressValidator());
    expect(result.current.state).toEqual({ status: "idle" });
  });

  it("moves to a result state for a valid list", () => {
    const { result } = renderHook(() => useBatchAddressValidator());

    act(() => result.current.submit(newlineSeparatedInput));

    expect(result.current.state.status).toBe("result");
    expect(result.current.state).toMatchObject({
      result: { summary: { valid: 2, invalid: 0, duplicated: 0 } }
    });
  });

  it("returns mixed results for a list with failures and duplicates", () => {
    const { result } = renderHook(() => useBatchAddressValidator());

    act(() => result.current.submit(mixedAddressList.join("\n")));

    expect(result.current.state).toEqual({ status: "result", result: batchAddressValidatorFixture });
  });

  it("reports empty input as an error", () => {
    const { result } = renderHook(() => useBatchAddressValidator());

    act(() => result.current.submit(""));

    expect(result.current.state).toEqual({ status: "error", code: "empty_input" });
  });

  it("never carries a secret seed into state", () => {
    const { result } = renderHook(() => useBatchAddressValidator());

    act(() => result.current.submit(secretSeedList.join("\n")));

    expect(result.current.state.status).toBe("result");
    expect(JSON.stringify(result.current.state)).not.toContain(secretSeed);
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useBatchAddressValidator());

    act(() => result.current.submit(validPublicKey));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
  });
});
