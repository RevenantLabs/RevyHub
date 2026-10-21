import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import {
  formatAssetIdentity,
  formatDecimalString,
  formatExpiration,
  formatFee,
  formatIndicativePrice,
  formatNetwork
} from "@/features/sep38-quote-viewer/lib/format";
import { normalizeOffChainAsset, normalizeOnChainAsset } from "@/features/sep38-quote-viewer/lib/asset-pair-fields";
import { SUPPORTED_AMOUNT } from "@/features/sep38-quote-viewer/fixtures/supported-pair.fixture";

describe("formatDecimalString", () => {
  it("keeps fractional digits and groups the integer part", () => {
    expect(formatDecimalString("100.50")).toBe("100.50");
    expect(formatDecimalString("1.2500000")).toBe("1.2500000");
    expect(formatDecimalString(SUPPORTED_AMOUNT)).toBe("1,000,000,000,000,000,000,000");
    expect(formatIndicativePrice("0.0000001")).toBe("0.0000001");
  });
});

describe("formatExpiration", () => {
  it("prints UTC and shifts offsets onto the UTC clock", () => {
    expect(formatExpiration("2026-06-01T15:04:05Z")).toBe("2026-06-01 15:04:05 UTC");
    expect(formatExpiration("2026-06-01T15:04:05.250Z")).toBe("2026-06-01 15:04:05 UTC");
    expect(formatExpiration("2026-06-01T15:04:05+02:00")).toBe("2026-06-01 13:04:05 UTC");
  });
});

describe("formatAssetIdentity", () => {
  it("shows the code and the canonical id", () => {
    const off = normalizeOffChainAsset("iso4217:USD");
    const native = normalizeOnChainAsset("stellar:native");
    const issuer = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9)).publicKey();
    const issued = normalizeOnChainAsset(`stellar:USDC:${issuer}`);
    expect(off.ok && formatAssetIdentity(off.value)).toBe("USD (iso4217:USD)");
    expect(native.ok && formatAssetIdentity(native.value)).toBe("XLM (stellar:native)");
    expect(issued.ok && formatAssetIdentity(issued.value)).toBe(`USDC (stellar:USDC:${issuer})`);
  });
});

describe("formatFee and formatNetwork", () => {
  it("formats the fee string and the network label", () => {
    expect(formatFee("0.30", "iso4217:USD")).toBe("0.30 iso4217:USD");
    expect(formatNetwork("testnet")).toBe("Testnet");
    expect(formatNetwork("mainnet")).toBe("Mainnet");
  });
});
