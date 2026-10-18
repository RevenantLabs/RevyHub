import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAmountConverter } from "@/features/amount-converter/hooks/useAmountConverter";
import {
  maxStroops,
  oneXlm,
  tooManyDecimals
} from "@/features/amount-converter/fixtures/amountConverter.fixture";

describe("useAmountConverter", () => {
  it("starts idle with empty fields", () => {
    const { result } = renderHook(() => useAmountConverter());
    expect(result.current.state).toEqual({ status: "idle" });
    expect(result.current.stroops).toBe("");
    expect(result.current.amount).toBe("");
  });

  it("updates the amount when stroops change", () => {
    const { result } = renderHook(() => useAmountConverter());

    act(() => result.current.updateStroops(oneXlm.stroops));

    expect(result.current.amount).toBe(oneXlm.amount);
    expect(result.current.state).toEqual({
      status: "result",
      result: oneXlm,
      source: "stroops"
    });
  });

  it("updates stroops when the amount changes", () => {
    const { result } = renderHook(() => useAmountConverter());

    act(() => result.current.updateAmount("0.0000001"));

    expect(result.current.stroops).toBe("1");
    expect(result.current.state.status).toBe("result");
  });

  it("does not loop when the paired field is written", () => {
    const { result } = renderHook(() => useAmountConverter());

    act(() => result.current.updateStroops("10000000"));
    act(() => result.current.updateAmount("1.0000000"));

    expect(result.current.stroops).toBe("10000000");
    expect(result.current.amount).toBe("1.0000000");
  });

  it("surfaces too_many_decimals for over-precise amounts", () => {
    const { result } = renderHook(() => useAmountConverter());

    act(() => result.current.updateAmount(tooManyDecimals));

    expect(result.current.state).toEqual({
      status: "error",
      code: "too_many_decimals",
      field: "amount"
    });
  });

  it("loads the int64 maximum example", () => {
    const { result } = renderHook(() => useAmountConverter());

    act(() => result.current.loadMaxExample());

    expect(result.current.stroops).toBe(maxStroops.stroops);
    expect(result.current.amount).toBe(maxStroops.amount);
    expect(result.current.state).toEqual({
      status: "result",
      result: maxStroops,
      source: "stroops"
    });
  });

  it("returns to idle on reset", () => {
    const { result } = renderHook(() => useAmountConverter());

    act(() => result.current.updateStroops(oneXlm.stroops));
    act(() => result.current.reset());

    expect(result.current.state).toEqual({ status: "idle" });
    expect(result.current.stroops).toBe("");
    expect(result.current.amount).toBe("");
  });
});
