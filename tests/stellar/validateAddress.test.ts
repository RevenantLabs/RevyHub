import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { validatePublicKey } from "../../lib/stellar/validateAddress";

describe("validatePublicKey", () => {
  it("accepts a valid Stellar public key", () => {
    const result = validatePublicKey(Keypair.random().publicKey());

    expect(result.valid).toBe(true);
    expect(result.code).toBe("valid");
    expect(result.message).toBe("This is a valid Stellar public address.");
  });

  it("trims surrounding whitespace before validating", () => {
    const result = validatePublicKey(`  ${Keypair.random().publicKey()}  `);

    expect(result.valid).toBe(true);
    expect(result.code).toBe("valid");
  });

  it("rejects empty input", () => {
    const result = validatePublicKey("   ");

    expect(result.valid).toBe(false);
    expect(result.code).toBe("empty");
    expect(result.message).toMatch(/Enter a Stellar public address/);
  });

  it("rejects secret-key prefixes before checksum validation", () => {
    const result = validatePublicKey("SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    expect(result.valid).toBe(false);
    expect(result.code).toBe("secret-key");
    expect(result.message).toMatch(/secret key/i);
  });

  it("rejects muxed-account prefixes with a dedicated explanation", () => {
    const result = validatePublicKey("MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    expect(result.valid).toBe(false);
    expect(result.code).toBe("muxed-account");
    expect(result.message).toMatch(/muxed account/i);
  });

  it("rejects addresses with an unrecognized prefix", () => {
    const result = validatePublicKey("XAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    expect(result.valid).toBe(false);
    expect(result.code).toBe("invalid-prefix");
    expect(result.message).toMatch(/start with the letter G/);
  });

  it("rejects addresses with characters outside the base32 alphabet", () => {
    const result = validatePublicKey("G0000000000000000000000000000000000000000000000000000");

    expect(result.valid).toBe(false);
    expect(result.code).toBe("invalid-characters");
    expect(result.message).toMatch(/A–Z and digits 2–7/);
  });

  it("rejects addresses with the wrong length", () => {
    const result = validatePublicKey("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    expect(result.valid).toBe(false);
    expect(result.code).toBe("invalid-length");
    expect(result.message).toMatch(/56 characters long/);
  });

  it("rejects malformed G-address checksums", () => {
    const result = validatePublicKey("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    expect(result.valid).toBe(false);
    expect(result.code).toBe("invalid-checksum");
    expect(result.message).toMatch(/checksum/);
  });

  it("never throws on unusual input", () => {
    const inputs = ["", " ", "🚀".repeat(50), "G".repeat(1000), "\u0000\u0001"];

    for (const input of inputs) {
      expect(() => validatePublicKey(input)).not.toThrow();
    }
  });
});
