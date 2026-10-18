import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { parseMultiAccountAssetExposureInput as parse } from "../schema";
import { accountA, accountB } from "../fixtures/multiAccountAssetExposure.fixture";
describe("account input", () => {
  it("accepts two public accounts in input order", () => {
    expect(parse(` ${accountB},\n${accountA} `)).toEqual({
      ok: true, value: { accountIds: [accountB, accountA] }
    });
  });
  it("requires two accounts and rejects malformed addresses", () => {
    expect(parse(accountA)).toEqual({ ok: false, code: "invalid_account" });
    expect(parse(`${accountA}\nGNOPE`)).toEqual({ ok: false, code: "invalid_account" });
  });
  it("rejects a seed by prefix before any other check", () => {
    expect(parse(`SNOTASEED\n${accountA}`)).toEqual({ ok: false, code: "invalid_account" });
    expect(parse(`SNOTASEED ${Array(11).fill(accountA).join(" ")}`)).toEqual({ ok: false, code: "invalid_account" });
  });
  it("rejects duplicates", () => {
    expect(parse(`${accountA} ${accountA}`)).toEqual({ ok: false, code: "duplicate_account" });
  });
  it("accepts ten but rejects eleven accounts", () => {
    const ids = Array.from({ length: 11 }, (_, n) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, n + 60)).publicKey());
    expect(parse(ids.slice(0, 10).join("\n")).ok).toBe(true);
    expect(parse(ids.join("\n"))).toEqual({ ok: false, code: "too_many_accounts" });
  });
});
