import { describe, expect, it } from "vitest";
import { classifyCodeLength } from "@/features/asset-identity-validator/lib/code-length-tier";
import { alphanum4Codes } from "@/features/asset-identity-validator/fixtures/alphanum4-codes.fixture";
import { alphanum12Codes } from "@/features/asset-identity-validator/fixtures/alphanum12-codes.fixture";

describe("classifyCodeLength", () => {
  it("treats an empty code as its own failure", () => {
    expect(classifyCodeLength("")).toEqual({ ok: false, code: "empty_code" });
  });

  it("classifies 1–4 characters as alphanumeric 4 before looking at the alphabet", () => {
    expect(classifyCodeLength(alphanum4Codes.shortest)).toEqual({
      ok: true,
      value: { tier: "alphanum4", length: 1 }
    });
    expect(classifyCodeLength(alphanum4Codes.longest)).toEqual({
      ok: true,
      value: { tier: "alphanum4", length: 4 }
    });
    const symbolTier = classifyCodeLength(alphanum4Codes.symbol);
    expect(symbolTier.ok && symbolTier.value).toEqual({
      tier: "alphanum4",
      length: 3
    });
  });

  it("classifies 5–12 characters as alphanumeric 12", () => {
    expect(classifyCodeLength(alphanum12Codes.shortest)).toEqual({
      ok: true,
      value: { tier: "alphanum12", length: 5 }
    });
    expect(classifyCodeLength(alphanum12Codes.longest)).toEqual({
      ok: true,
      value: { tier: "alphanum12", length: 12 }
    });
  });

  it("rejects one character past alphanumeric 12 as a length failure", () => {
    const result = classifyCodeLength(alphanum12Codes.tooLong);

    expect(result).toEqual({ ok: false, code: "invalid_code_length" });
    expect(alphanum12Codes.tooLong).toHaveLength(13);
  });
});
