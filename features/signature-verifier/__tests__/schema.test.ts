import { describe, expect, it } from "vitest";
import { parseSignatureVerifierInput } from "@/features/signature-verifier/schema";

describe("parseSignatureVerifierInput", () => {
  it("rejects empty input", () => {
    const result = parseSignatureVerifierInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("normalises surrounding whitespace", () => {
    const result = parseSignatureVerifierInput(' {"publicKey":"GABC","message":"hello","signature":"aa","messageEncoding":"utf8","signatureEncoding":"hex"} ');
    expect(result.ok && result.value.message).toBe("hello");
  });
});
