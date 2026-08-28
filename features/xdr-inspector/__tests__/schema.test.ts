import { describe, expect, it } from "vitest";
import { MAX_XDR_LENGTH, parseXdrInput } from "@/features/xdr-inspector/schema";
import {
  notBase64,
  paymentXdr
} from "@/features/xdr-inspector/fixtures/xdrInspector.fixture";

describe("parseXdrInput", () => {
  it("rejects empty input", () => {
    expect(parseXdrInput("   \n ")).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects text that is not base64", () => {
    expect(parseXdrInput(notBase64)).toEqual({ ok: false, code: "invalid_base64" });
  });

  it("rejects base64 whose length is not a multiple of four", () => {
    expect(parseXdrInput("AAAAA")).toEqual({ ok: false, code: "invalid_base64" });
  });

  it("rejects input beyond the length cap", () => {
    expect(parseXdrInput("A".repeat(MAX_XDR_LENGTH + 4))).toEqual({
      ok: false,
      code: "input_too_large"
    });
  });

  it("strips whitespace from a wrapped paste", () => {
    const wrapped = `${paymentXdr.slice(0, 40)}\n  ${paymentXdr.slice(40)}`;
    const result = parseXdrInput(wrapped);

    expect(result.ok && result.value.envelope).toBe(paymentXdr);
  });

  it("accepts a well-formed envelope", () => {
    expect(parseXdrInput(paymentXdr).ok).toBe(true);
  });
});
