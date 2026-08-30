import { describe, expect, it } from "vitest";
import {
  convertFromAmount,
  convertFromStroops,
  maxStroopExample
} from "@/features/amount-converter/lib/amountConverter";
import { maxStroops, oneStroop, oneXlm, tooManyDecimals } from "@/features/amount-converter/fixtures/amountConverter.fixture";

describe("convertFromStroops", () => {
  it("converts stroops to a seven-decimal display amount", () => {
    expect(convertFromStroops(oneStroop.stroops)).toEqual({ ok: true, value: oneStroop });
    expect(convertFromStroops(oneXlm.stroops)).toEqual({ ok: true, value: oneXlm });
  });

  it("preserves the int64 maximum exactly", () => {
    expect(convertFromStroops(maxStroops.stroops)).toEqual({ ok: true, value: maxStroops });
    expect(maxStroopExample()).toEqual(maxStroops);
  });

  it("rejects empty input", () => {
    expect(convertFromStroops("")).toEqual({ ok: false, code: "empty_input" });
    expect(convertFromStroops("   ")).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects negative stroops", () => {
    expect(convertFromStroops("-1")).toEqual({ ok: false, code: "negative_not_allowed" });
  });

  it("rejects non-integer stroop strings", () => {
    expect(convertFromStroops("1.5")).toEqual({ ok: false, code: "invalid_amount" });
    expect(convertFromStroops("abc")).toEqual({ ok: false, code: "invalid_amount" });
  });

  it("rejects stroops above the int64 maximum", () => {
    expect(convertFromStroops("9223372036854775808")).toEqual({ ok: false, code: "out_of_range" });
  });

  it("normalises leading zero stroops", () => {
    expect(convertFromStroops("007")).toEqual({
      ok: true,
      value: { stroops: "7", amount: "0.0000007" }
    });
  });
});

describe("convertFromAmount", () => {
  it("converts display amounts to stroops exactly", () => {
    expect(convertFromAmount("0.0000001")).toEqual({ ok: true, value: oneStroop });
    expect(convertFromAmount("1")).toEqual({ ok: true, value: oneXlm });
    expect(convertFromAmount("922337203685.4775807")).toEqual({ ok: true, value: maxStroops });
  });

  it("rejects more than seven decimal places instead of rounding", () => {
    expect(convertFromAmount(tooManyDecimals)).toEqual({ ok: false, code: "too_many_decimals" });
  });

  it("rejects empty input", () => {
    expect(convertFromAmount("")).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects negative amounts", () => {
    expect(convertFromAmount("-0.1")).toEqual({ ok: false, code: "negative_not_allowed" });
  });

  it("rejects malformed decimals", () => {
    expect(convertFromAmount("1..0")).toEqual({ ok: false, code: "invalid_amount" });
    expect(convertFromAmount("xlm")).toEqual({ ok: false, code: "invalid_amount" });
  });

  it("rejects amounts that exceed the int64 stroop range", () => {
    expect(convertFromAmount("922337203685.4775808")).toEqual({ ok: false, code: "out_of_range" });
  });
});

describe("round trip", () => {
  it("matches stroops after amount conversion", () => {
    const fromAmount = convertFromAmount("1250.5000000");
    expect(fromAmount.ok).toBe(true);
    if (!fromAmount.ok) return;

    expect(convertFromStroops(fromAmount.value.stroops)).toEqual({ ok: true, value: fromAmount.value });
  });
});
