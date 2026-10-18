import { describe, expect, it } from "vitest";
import { parseAccountSignersInput } from "@/features/account-signers/schema";
import { accountId } from "@/features/account-signers/fixtures/accountSigners.fixture";

describe("parseAccountSignersInput", () => {
  it("rejects empty and whitespace-only input", () => {
    expect(parseAccountSignersInput(" \n\t ")).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects a public key missing one checksum character", () => {
    expect(parseAccountSignersInput(accountId.slice(0, -1))).toEqual({
      ok: false,
      code: "invalid_address"
    });
  });

  it("rejects extra data beyond a complete public key", () => {
    expect(parseAccountSignersInput(`${accountId}A`)).toEqual({
      ok: false,
      code: "invalid_address"
    });
  });

  it("rejects a secret-key prefix before checksum validation", () => {
    expect(parseAccountSignersInput("S-not-a-complete-secret-seed")).toEqual({
      ok: false,
      code: "invalid_address"
    });
  });

  it("accepts a complete public account address and removes stray whitespace", () => {
    const result = parseAccountSignersInput(`  ${accountId.slice(0, 28)}\n${accountId.slice(28)} `);
    expect(result.ok && result.value.accountId).toBe(accountId);
  });
});
