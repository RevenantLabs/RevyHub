import { describe, expect, it } from "vitest";
import {
  assignSellAndBuy,
  containsSecretKey,
  normalizeOffChainAsset,
  normalizeOnChainAsset,
  positiveDecimal,
  scrubSecret
} from "@/features/sep38-quote-viewer/lib/asset-pair-fields";
import {
  issuer,
  secretSeed
} from "@/features/sep38-quote-viewer/fixtures/sep38QuoteViewer.fixture";
import { SUPPORTED_AMOUNT } from "@/features/sep38-quote-viewer/fixtures/supported-pair.fixture";

describe("normalizeOffChainAsset", () => {
  it("accepts an uppercase ISO 4217 id and rejects Stellar or lowercase codes", () => {
    expect(normalizeOffChainAsset(" iso4217:USD ")).toEqual({
      ok: true,
      value: { kind: "off-chain", scheme: "iso4217", code: "USD", canonical: "iso4217:USD" }
    });
    expect(normalizeOffChainAsset("iso4217:usd").ok).toBe(false);
    expect(normalizeOffChainAsset(`stellar:USDC:${issuer}`).ok).toBe(false);
    expect(normalizeOffChainAsset("iso4217:USDT").ok).toBe(false);
  });
});

describe("normalizeOnChainAsset", () => {
  it("canonicalises native and issued assets", () => {
    expect(normalizeOnChainAsset("native")).toMatchObject({
      ok: true,
      value: { canonical: "stellar:native", native: true, code: "XLM" }
    });
    const issued = normalizeOnChainAsset(`stellar:USDC:${issuer}`);
    expect(issued).toMatchObject({
      ok: true,
      value: { canonical: `stellar:USDC:${issuer}`, issuer, native: false }
    });
  });

  it("rejects a secret on the S prefix and does not return it", () => {
    expect(containsSecretKey(secretSeed)).toBe(true);
    expect(containsSecretKey(`stellar:USDC:${secretSeed}`)).toBe(true);
    const result = normalizeOnChainAsset(secretSeed);
    expect(result).toEqual({ ok: false, code: "invalid_asset" });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
    expect(scrubSecret(secretSeed)).toBe("");
  });

  it("rejects a bad checksum and an issued XLM code", () => {
    expect(normalizeOnChainAsset(`stellar:USDC:${issuer.slice(0, -1)}A`).ok).toBe(false);
    expect(normalizeOnChainAsset(`stellar:XLM:${issuer}`).ok).toBe(false);
    expect(normalizeOnChainAsset("iso4217:USD").ok).toBe(false);
  });
});

describe("positiveDecimal and assignSellAndBuy", () => {
  it("scales a huge amount with BigInt and assigns the sell side", () => {
    const parsed = positiveDecimal(SUPPORTED_AMOUNT);
    expect(parsed?.text).toBe(SUPPORTED_AMOUNT);
    expect(parsed?.scaled).toBe(1000000000000000000000n);
    expect(positiveDecimal("0.00")).toBeNull();
    expect(positiveDecimal("1e3")).toBeNull();

    const off = normalizeOffChainAsset("iso4217:EUR");
    const on = normalizeOnChainAsset("stellar:native");
    if (!off.ok || !on.ok) throw new Error("fixtures should normalize");
    expect(assignSellAndBuy(off.value, on.value, "on-chain")).toEqual({
      sellAsset: "stellar:native",
      buyAsset: "iso4217:EUR"
    });
  });
});
