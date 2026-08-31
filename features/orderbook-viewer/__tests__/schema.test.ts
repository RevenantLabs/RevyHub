import { Keypair } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import { parseOrderbookViewerInput } from "@/features/orderbook-viewer/schema";

const issuer = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 8)).publicKey();

describe("parseOrderbookViewerInput", () => {
  it("reports pair-specific missing and invalid assets", () => {
    expect(parseOrderbookViewerInput("   ")).toEqual({ ok: false, code: "empty_selling_asset" });
    expect(parseOrderbookViewerInput(JSON.stringify({ buying: "native" }))).toEqual({ ok: false, code: "empty_selling_asset" });
    expect(parseOrderbookViewerInput(JSON.stringify({ selling: "native", buying: { code: "USDC", issuer: "nope" } }))).toEqual({ ok: false, code: "invalid_buying_asset" });
  });

  it("accepts native and issued assets and rejects identical pairs", () => {
    const parsed = parseOrderbookViewerInput(JSON.stringify({ selling: "native", buying: { code: "USDC", issuer } }));
    expect(parsed.ok).toBe(true);
    expect(parseOrderbookViewerInput(JSON.stringify({ selling: "native", buying: "XLM" }))).toEqual({ ok: false, code: "same_asset" });
    expect(parseOrderbookViewerInput(JSON.stringify({ selling: { code: "USDC", issuer: "S123" }, buying: "native" }))).toEqual({ ok: false, code: "invalid_selling_asset" });
  });
});
