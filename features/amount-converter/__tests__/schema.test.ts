import { describe, expect, it } from "vitest";
import { parseAmountConverterField } from "@/features/amount-converter/schema";

describe("parseAmountConverterField", () => {
  it("rejects empty input", () => {
    expect(parseAmountConverterField("stroops", "   ")).toEqual({ ok: false, code: "empty_input" });
    expect(parseAmountConverterField("amount", "")).toEqual({ ok: false, code: "empty_input" });
  });

  it("normalises surrounding whitespace", () => {
    expect(parseAmountConverterField("stroops", "  100  ")).toEqual({ ok: true, value: "100" });
    expect(parseAmountConverterField("amount", "  1.5  ")).toEqual({ ok: true, value: "1.5" });
  });
});
