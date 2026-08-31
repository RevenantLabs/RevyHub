import { Keypair } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import { parseTradeHistoryInput } from "@/features/trade-history/schema";

const account = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 10)).publicKey();
const issuer = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 11)).publicKey();

describe("parseTradeHistoryInput", () => {
  it("requires either an account or a complete pair", () => {
    expect(parseTradeHistoryInput("   ")).toEqual({ ok: false, code: "empty_filter" });
    expect(parseTradeHistoryInput(JSON.stringify({ base: "native" }))).toEqual({ ok: false, code: "invalid_asset" });
    expect(parseTradeHistoryInput(JSON.stringify({ account: "Ssecret" }))).toEqual({ ok: false, code: "invalid_address" });
  });

  it("accepts pair and account filters together", () => {
    const result = parseTradeHistoryInput(JSON.stringify({ base: "native", counter: { code: "USDC", issuer }, account, limit: 50 }));
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.limit).toBe(50);
  });
});
