import { Keypair } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import { parseTradeAggregationViewerInput, RESOLUTIONS } from "@/features/trade-aggregation-viewer/schema";

const issuer = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9)).publicKey();
const pair = { base: "native", counter: { code: "USDC", issuer } };

describe("parseTradeAggregationViewerInput", () => {
  it("validates both assets and distinguishes an identical pair", () => {
    expect(parseTradeAggregationViewerInput("   ")).toEqual({ ok: false, code: "empty_base_asset" });
    expect(parseTradeAggregationViewerInput(JSON.stringify({ counter: "native" }))).toEqual({ ok: false, code: "empty_base_asset" });
    expect(parseTradeAggregationViewerInput(JSON.stringify({ ...pair, counter: { code: "USDC", issuer: "nope" } }))).toEqual({ ok: false, code: "invalid_counter_asset" });
    expect(parseTradeAggregationViewerInput(JSON.stringify({ base: "native", counter: "XLM" }))).toEqual({ ok: false, code: "same_asset" });
  });

  it("enforces Horizon resolutions and offset rules", () => {
    const valid = parseTradeAggregationViewerInput(JSON.stringify({ ...pair, resolution: RESOLUTIONS[4], offsetHours: 1 }));
    expect(valid.ok).toBe(true);
    expect(parseTradeAggregationViewerInput(JSON.stringify({ ...pair, resolution: 123 }))).toEqual({ ok: false, code: "invalid_resolution" });
    expect(parseTradeAggregationViewerInput(JSON.stringify({ ...pair, resolution: RESOLUTIONS[0], offsetHours: 1 }))).toEqual({ ok: false, code: "invalid_offset" });
    expect(parseTradeAggregationViewerInput(JSON.stringify({ ...pair, resolution: RESOLUTIONS[3], offsetHours: 1.5 }))).toEqual({ ok: false, code: "invalid_offset" });
  });
});
