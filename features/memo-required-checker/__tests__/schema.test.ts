import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { parseMemoRequiredCheckerInput } from "@/features/memo-required-checker/schema";
import { accountId } from "@/features/memo-required-checker/fixtures/memoRequiredChecker.fixture";

describe("parseMemoRequiredCheckerInput", () => {
  it("accepts a public account id", () => {
    expect(parseMemoRequiredCheckerInput({ accountId })).toEqual({
      ok: true,
      value: { accountId }
    });
  });

  it("rejects a secret seed before any request", () => {
    const secret = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9)).secret();
    expect(parseMemoRequiredCheckerInput({ accountId: secret })).toEqual({
      ok: false,
      code: "invalid_account"
    });
  });

  it("rejects an empty account", () => {
    expect(parseMemoRequiredCheckerInput({ accountId: "  " })).toEqual({
      ok: false,
      code: "invalid_account"
    });
  });
});
