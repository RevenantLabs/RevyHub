import { describe, expect, it } from "vitest";
import { MAX_RESULT_XDR_LENGTH, parseResultCodeExplainerInput } from "@/features/result-code-explainer/schema";
import {
  failedPaymentResultXdr,
  notBase64
} from "@/features/result-code-explainer/fixtures/resultCodeExplainer.fixture";

describe("parseResultCodeExplainerInput", () => {
  it("rejects empty code input", () => {
    expect(parseResultCodeExplainerInput({ mode: "code", value: "   " })).toEqual({
      ok: false,
      code: "empty_input"
    });
  });

  it("accepts code lists with surrounding whitespace", () => {
    const result = parseResultCodeExplainerInput({ mode: "code", value: "  tx_failed  " });
    expect(result.ok && result.value.value).toBe("tx_failed");
  });

  it("rejects non-base64 XDR", () => {
    expect(parseResultCodeExplainerInput({ mode: "xdr", value: notBase64 })).toEqual({
      ok: false,
      code: "invalid_base64"
    });
  });

  it("rejects XDR beyond the length cap", () => {
    expect(
      parseResultCodeExplainerInput({ mode: "xdr", value: "A".repeat(MAX_RESULT_XDR_LENGTH + 4) })
    ).toEqual({ ok: false, code: "input_too_large" });
  });

  it("strips whitespace from wrapped XDR", () => {
    const wrapped = `${failedPaymentResultXdr.slice(0, 20)}\n  ${failedPaymentResultXdr.slice(20)}`;
    const result = parseResultCodeExplainerInput({ mode: "xdr", value: wrapped });
    expect(result.ok && result.value.value).toBe(failedPaymentResultXdr);
  });

  it("accepts well-formed result XDR", () => {
    expect(parseResultCodeExplainerInput({ mode: "xdr", value: failedPaymentResultXdr }).ok).toBe(
      true
    );
  });
});
