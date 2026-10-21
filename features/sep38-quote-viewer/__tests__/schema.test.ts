import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { parseHomeDomain, parseSep38QuoteViewerInput } from "@/features/sep38-quote-viewer/schema";
import {
  OFF_CHAIN_ASSET,
  ON_CHAIN_ASSET,
  SELL_AMOUNT,
  issuer,
  normalRaw,
  secretSeed
} from "@/features/sep38-quote-viewer/fixtures/sep38QuoteViewer.fixture";
import { SUPPORTED_AMOUNT } from "@/features/sep38-quote-viewer/fixtures/supported-pair.fixture";

const twelve = `stellar:ABCDEFGHIJKL:${issuer}`;

describe("parseHomeDomain", () => {
  it("accepts a hostname and a bare https origin", () => {
    expect(parseHomeDomain("  Quote.Example  ")).toEqual({ ok: true, value: "quote.example" });
    expect(parseHomeDomain("https://quote.example")).toEqual({ ok: true, value: "quote.example" });
  });

  it("rejects paths, plaintext, localhost, and a secret seed", () => {
    expect(parseHomeDomain("")).toEqual({ ok: false, code: "invalid_home_domain" });
    expect(parseHomeDomain("http://quote.example")).toEqual({ ok: false, code: "invalid_home_domain" });
    expect(parseHomeDomain("https://quote.example/sep38")).toEqual({ ok: false, code: "invalid_home_domain" });
    expect(parseHomeDomain("localhost")).toEqual({ ok: false, code: "invalid_home_domain" });
    expect(parseHomeDomain(secretSeed).ok).toBe(false);
    expect(JSON.stringify(parseHomeDomain(secretSeed))).not.toContain(secretSeed);
  });
});

describe("parseSep38QuoteViewerInput", () => {
  it("normalises a supported off-chain and on-chain pair", () => {
    const result = parseSep38QuoteViewerInput(normalRaw);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.sellAsset).toBe(OFF_CHAIN_ASSET);
    expect(result.value.buyAsset).toBe(ON_CHAIN_ASSET);
    expect(result.value.sellAmount).toBe(SELL_AMOUNT);
    expect(result.value.onChain.issuer).toBe(issuer);
  });

  it("keeps a 22-digit amount as a string and a BigInt scale", () => {
    const result = parseSep38QuoteViewerInput({
      ...normalRaw,
      offChainAsset: "iso4217:EUR",
      onChainAsset: "native",
      sellSide: "on-chain",
      sellAmount: SUPPORTED_AMOUNT
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.sellAmount).toBe(SUPPORTED_AMOUNT);
    expect(result.value.sellAsset).toBe("stellar:native");
    expect(result.value.buyAsset).toBe("iso4217:EUR");
    expect(Number.isSafeInteger(Number(SUPPORTED_AMOUNT))).toBe(false);
  });

  it("accepts a 12-character asset code and rejects a 13th character", () => {
    expect(parseSep38QuoteViewerInput({ ...normalRaw, onChainAsset: twelve }).ok).toBe(true);
    const tooLong = parseSep38QuoteViewerInput({
      ...normalRaw,
      onChainAsset: `stellar:ABCDEFGHIJKLM:${issuer}`
    });
    expect(tooLong).toMatchObject({ ok: false, code: "invalid_asset", detail: "on_chain" });
  });

  it("rejects a secret issuer before checksum and does not echo it", () => {
    const result = parseSep38QuoteViewerInput({
      ...normalRaw,
      onChainAsset: `stellar:USDC:${secretSeed}`
    });
    expect(result).toMatchObject({ ok: false, code: "invalid_asset", detail: "on_chain" });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });

  it("rejects the reserved XLM code when a custom issuer is attached", () => {
    expect(
      parseSep38QuoteViewerInput({ ...normalRaw, onChainAsset: `stellar:XLM:${issuer}` })
    ).toMatchObject({ ok: false, code: "invalid_asset", detail: "on_chain" });
  });

  it("rejects an on-chain id in the off-chain field and a bad amount", () => {
    expect(
      parseSep38QuoteViewerInput({ ...normalRaw, offChainAsset: ON_CHAIN_ASSET })
    ).toMatchObject({ ok: false, code: "invalid_asset", detail: "off_chain" });
    expect(parseSep38QuoteViewerInput({ ...normalRaw, sellAmount: "0.00" })).toMatchObject({
      ok: false,
      code: "invalid_amount",
      detail: "amount"
    });
    expect(parseSep38QuoteViewerInput({ ...normalRaw, sellAmount: "1e2" })).toMatchObject({
      ok: false,
      code: "invalid_amount"
    });
  });

  it("rejects a checksum-invalid issuer", () => {
    const valid = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 3)).publicKey();
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".split("");
    const replacement = alphabet.find((char) => char !== valid[valid.length - 1]) ?? "A";
    const candidate = `${valid.slice(0, -1)}${replacement}`;
    const result = parseSep38QuoteViewerInput({ ...normalRaw, onChainAsset: `stellar:USDC:${candidate}` });
    expect(result).toMatchObject({ ok: false, code: "invalid_asset", detail: "on_chain" });
  });
});
