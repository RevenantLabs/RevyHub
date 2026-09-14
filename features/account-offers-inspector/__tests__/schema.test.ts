import { describe, it, expect } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { parseAccountOffersInput } from "@/features/account-offers-inspector/schema";

describe("parseAccountOffersInput", () => {
  it("accepts valid account address", () => {
    const keypair = Keypair.random();
    const result = parseAccountOffersInput(keypair.publicKey());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.accountId).toBe(keypair.publicKey());
    }
  });

  it("rejects empty input", () => {
    expect(parseAccountOffersInput("").ok).toBe(false);
    expect(parseAccountOffersInput("   ").ok).toBe(false);
  });

  it("rejects invalid address", () => {
    const result = parseAccountOffersInput("not-a-valid-address");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("invalid_address");
    }
  });

  it("rejects S-prefixed seeds", () => {
    const result = parseAccountOffersInput("SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    expect(result.ok).toBe(false);
  });
});
