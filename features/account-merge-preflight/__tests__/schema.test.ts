import { describe, expect, it } from "vitest";
import { parseAccountMergePreflightInput } from "@/features/account-merge-preflight/schema";
import { Keypair } from "@stellar/stellar-sdk";

describe("parseAccountMergePreflightInput", () => {
  const source = Keypair.random().publicKey();
  const dest = Keypair.random().publicKey();

  it("rejects empty source", () => {
    const result = parseAccountMergePreflightInput("   ", dest);
    expect(result).toEqual({ ok: false, code: "empty_source" });
  });

  it("rejects invalid source", () => {
    const result = parseAccountMergePreflightInput("invalid", dest);
    expect(result).toEqual({ ok: false, code: "invalid_source" });
  });

  it("rejects empty destination", () => {
    const result = parseAccountMergePreflightInput(source, "   ");
    expect(result).toEqual({ ok: false, code: "empty_destination" });
  });

  it("rejects invalid destination", () => {
    const result = parseAccountMergePreflightInput(source, "invalid");
    expect(result).toEqual({ ok: false, code: "invalid_destination" });
  });

  it("rejects same account", () => {
    const result = parseAccountMergePreflightInput(source, source);
    expect(result).toEqual({ ok: false, code: "same_account" });
  });

  it("accepts valid distinct accounts, normalising whitespace", () => {
    const result = parseAccountMergePreflightInput(`  ${source}  `, ` ${dest} `);
    expect(result.ok && result.value.source).toBe(source);
    expect(result.ok && result.value.destination).toBe(dest);
  });
});
