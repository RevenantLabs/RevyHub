import { describe, expect, it } from "vitest";
import { parsePaymentMemoPolicyCheckerInput } from "@/features/payment-memo-policy-checker/schema";

describe("parsePaymentMemoPolicyCheckerInput", () => {
  it("rejects empty input", () => {
    const result = parsePaymentMemoPolicyCheckerInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("normalises surrounding whitespace", () => {
    const result = parsePaymentMemoPolicyCheckerInput("  example  ");
    expect(result.ok && result.value.value).toBe("example");
  });
});
