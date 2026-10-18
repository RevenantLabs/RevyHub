import { describe, expect, it } from "vitest";
import { parseSep7SignatureVerifierInput } from "@/features/sep7-signature-verifier/schema";

describe("parseSep7SignatureVerifierInput", () => {
  it("rejects empty input", () => {
    const result = parseSep7SignatureVerifierInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("parses a signed URI and preserves its unsigned form", () => {
    const result = parseSep7SignatureVerifierInput("  web+stellar:pay?origin_domain=example.com&signature=abc  ");
    expect(result.ok && result.value.originDomain).toBe("example.com");
    expect(result.ok && result.value.unsignedUri).toBe("web+stellar:pay?origin_domain=example.com");
  });

  it("removes only signature while preserving query bytes and order", () => {
    const uri = "web+stellar:pay?msg=hello%20world&signature=a%2Bb&origin_domain=example.com";
    const result = parseSep7SignatureVerifierInput(uri);
    expect(result.ok && result.value.unsignedUri).toBe("web+stellar:pay?msg=hello%20world&origin_domain=example.com");
    expect(result.ok && result.value.signature).toBe("a+b");
  });

  it.each([
    ["https://example.com?signature=x", "wrong_scheme"],
    ["web+stellar:pay?origin_domain=example.com", "no_signature"],
    ["web+stellar:pay?signature=x", "no_origin_domain"]
  ])("rejects %s", (value, code) => expect(parseSep7SignatureVerifierInput(value)).toEqual({ ok: false, code }));
});
