import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { validatePublicKey } from "../../lib/stellar/validateAddress";

describe("validatePublicKey", () => {
  it("accepts a valid Stellar public key formatted with 56 characters starting with G", () => {
    // Known well-formed Stellar public key (56 characters starting with 'G')
    const validAddress = "GBGYX3ZGXAZZFZVLLHODPHOSM4SQRMEJVBSFYAJ2LSN4G7ZPQEN74IY4";
    const result = validatePublicKey(validAddress);

    expect(result.valid).toBe(true);
    expect(result.message).toBe("This is a valid Stellar public address.");
  });

  it("accepts a dynamically generated valid Stellar public key", () => {
    const randomAddress = Keypair.random().publicKey();
    const result = validatePublicKey(randomAddress);

    expect(result.valid).toBe(true);
    expect(result.message).toBe("This is a valid Stellar public address.");
  });

  it("rejects empty string input gracefully", () => {
    const result = validatePublicKey("");

    expect(result.valid).toBe(false);
    expect(result.message).toBe("Enter a Stellar public address to validate it.");
  });

  it("rejects whitespace-only string input gracefully", () => {
    const result = validatePublicKey("   ");

    expect(result.valid).toBe(false);
    expect(result.message).toBe("Enter a Stellar public address to validate it.");
  });

  it("rejects secret-key prefixes before checksum validation", () => {
    const result = validatePublicKey("SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    expect(result.valid).toBe(false);
    expect(result.message).toBe("Stellar public addresses usually start with G and are safe to share.");
  });

  it("rejects non-G prefixes", () => {
    const result = validatePublicKey("MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    expect(result.valid).toBe(false);
    expect(result.message).toBe("Stellar public addresses usually start with G and are safe to share.");
  });

  it("rejects wrong length input", () => {
    const result = validatePublicKey("G12345");

    expect(result.valid).toBe(false);
    expect(result.message).toBe("This does not match Stellar public key checksum or length requirements.");
  });

  it("rejects malformed G-address checksums", () => {
    const result = validatePublicKey("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    expect(result.valid).toBe(false);
    expect(result.message).toBe("This does not match Stellar public key checksum or length requirements.");
  });

  it("rejects invalid characters in G-address", () => {
    const result = validatePublicKey("G!@#$%^&*()12345678901234567890123456789012345678901234567");

    expect(result.valid).toBe(false);
    expect(result.message).toBe("This does not match Stellar public key checksum or length requirements.");
  });
});
