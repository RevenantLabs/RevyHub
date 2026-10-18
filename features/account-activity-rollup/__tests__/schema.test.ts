import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { parseAccountActivityRollupInput, parseActivityCursor } from "@/features/account-activity-rollup/schema";
import { accountId } from "@/features/account-activity-rollup/fixtures/accountActivityRollup.fixture";

describe("account activity input", () => {
  it("accepts a trimmed public account", () => expect(parseAccountActivityRollupInput(` ${accountId} `)).toEqual({ ok: true, value: { accountId } }));
  it("rejects empty and malformed addresses", () => {
    expect(parseAccountActivityRollupInput("")).toEqual({ ok: false, code: "invalid_account" });
    expect(parseAccountActivityRollupInput("GINVALID")).toEqual({ ok: false, code: "invalid_account" });
  });
  it("rejects a secret before storing it", () => {
    const secret = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 36)).secret();
    expect(JSON.stringify(parseAccountActivityRollupInput(secret))).not.toContain(secret);
  });
  it("validates numeric paging tokens", () => {
    expect(parseActivityCursor("123")).toEqual({ ok: true, value: "123" });
    expect(parseActivityCursor("123&limit=200")).toEqual({ ok: false, code: "invalid_cursor" });
    expect(parseActivityCursor(12)).toEqual({ ok: false, code: "invalid_cursor" });
  });
});
