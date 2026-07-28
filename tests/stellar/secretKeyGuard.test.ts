import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { detectSecretKey } from "../../lib/stellar/secretKeyGuard";

describe("detectSecretKey", () => {
  it("rejects a valid Stellar public key", () => {
    expect(detectSecretKey(Keypair.random().publicKey())).toBe(false);
  });

  it("detects a valid secret seed", () => {
    const secret = Keypair.random().secret();
    expect(detectSecretKey(secret)).toBe(true);
  });

  it("detects a lowercase secret seed", () => {
    const secret = Keypair.random().secret().toLowerCase();
    expect(detectSecretKey(secret)).toBe(true);
  });

  it("detects a secret seed with surrounding whitespace", () => {
    const secret = `  ${Keypair.random().secret()}  `;
    expect(detectSecretKey(secret)).toBe(true);
  });

  it("detects a lowercase secret seed with whitespace", () => {
    const secret = `\t${Keypair.random().secret().toLowerCase()}\n`;
    expect(detectSecretKey(secret)).toBe(true);
  });

  it("rejects empty input", () => {
    expect(detectSecretKey("")).toBe(false);
  });

  it("rejects whitespace-only input", () => {
    expect(detectSecretKey("   ")).toBe(false);
  });

  it("rejects a short string starting with S", () => {
    expect(detectSecretKey("S")).toBe(false);
  });

  it("rejects a malformed seed of the right length", () => {
    const malformed = "S" + "A".repeat(55);
    expect(detectSecretKey(malformed)).toBe(false);
  });

  it("rejects an all-zero-length-56 string starting with S", () => {
    const zeroes = "S" + "0".repeat(55);
    expect(detectSecretKey(zeroes)).toBe(false);
  });

  it("rejects a valid Muxed account address (M-prefix)", () => {
    // M-prefix addresses are 69 characters
    const muxed = "M" + "A".repeat(68);
    expect(detectSecretKey(muxed)).toBe(false);
  });

  it("rejects a valid Contract address (C-prefix)", () => {
    const contract = "C" + "A".repeat(55);
    expect(detectSecretKey(contract)).toBe(false);
  });

  it("rejects a transaction hash (64 hex chars)", () => {
    const hash = "a" + "0".repeat(63);
    expect(detectSecretKey(hash)).toBe(false);
  });

  it("rejects a string with invalid base58 characters", () => {
    const invalid = "S" + "0".repeat(54) + "l";
    expect(detectSecretKey(invalid)).toBe(false);
  });

  it("rejects a public key with wrong prefix but right length", () => {
    const wrongPrefix = "X" + "A".repeat(55);
    expect(detectSecretKey(wrongPrefix)).toBe(false);
  });
});
