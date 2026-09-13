import { describe, expect, it } from "vitest";
import {
  decodeAssetXdr,
  encodeAssetDescriptor,
  runAssetDescriptorCodec
} from "@/features/asset-descriptor-codec/lib/assetDescriptorCodec";
import {
  boundariesFixture,
  credit12Fixture,
  credit4Fixture,
  creditXlmFixture,
  issuerA,
  nativeFixture,
  poolShareXdrFixture,
  secretSeed,
  trailingBytesXdrFixture
} from "@/features/asset-descriptor-codec/fixtures/assetDescriptorCodec.fixture";

describe("assetDescriptorCodec domain logic", () => {
  describe("encodeAssetDescriptor", () => {
    it("encodes native XLM descriptor into canonical format and root Asset XDR", () => {
      const result = encodeAssetDescriptor("native");
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toEqual({
        mode: "encode",
        type: "native",
        code: "XLM",
        issuer: null,
        canonicalDescriptor: "native",
        xdr: nativeFixture.xdr,
        json: {
          type: "native",
          code: "XLM",
          issuer: null,
          canonical: "native",
          xdr: nativeFixture.xdr
        }
      });
    });

    it("encodes credit_alphanum4 asset with 4-character code", () => {
      const result = encodeAssetDescriptor(credit4Fixture.raw);
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.type).toBe("credit_alphanum4");
      expect(result.value.code).toBe("USDC");
      expect(result.value.issuer).toBe(credit4Fixture.issuer);
      expect(result.value.canonicalDescriptor).toBe(credit4Fixture.canonicalDescriptor);
      expect(result.value.xdr).toBe(credit4Fixture.xdr);
    });

    it("encodes credit_alphanum12 asset across the 5 to 12 character boundary", () => {
      const fiveChar = encodeAssetDescriptor(boundariesFixture.fiveChars.raw);
      expect(fiveChar.ok).toBe(true);
      if (!fiveChar.ok) return;
      expect(fiveChar.value.type).toBe("credit_alphanum12");
      expect(fiveChar.value.code).toBe("TOKEN");

      const twelveChar = encodeAssetDescriptor(boundariesFixture.twelveChars.raw);
      expect(twelveChar.ok).toBe(true);
      if (!twelveChar.ok) return;
      expect(twelveChar.value.type).toBe("credit_alphanum12");
      expect(twelveChar.value.code).toBe("TWELVECHARS1");
    });

    it("strictly distinguishes native XLM from an issued asset with code XLM", () => {
      const nativeResult = encodeAssetDescriptor("native");
      const creditXlmResult = encodeAssetDescriptor(creditXlmFixture.raw);

      expect(nativeResult.ok).toBe(true);
      expect(creditXlmResult.ok).toBe(true);
      if (!nativeResult.ok || !creditXlmResult.ok) return;

      expect(nativeResult.value.type).toBe("native");
      expect(nativeResult.value.issuer).toBeNull();
      expect(nativeResult.value.xdr).toBe("AAAAAA==");

      expect(creditXlmResult.value.type).toBe("credit_alphanum4");
      expect(creditXlmResult.value.issuer).toBe(issuerA);
      expect(creditXlmResult.value.canonicalDescriptor).toBe(`XLM:${issuerA}`);
      expect(creditXlmResult.value.xdr).not.toBe("AAAAAA==");
    });

    it("preserves asset code case sensitivity", () => {
      const lowerResult = encodeAssetDescriptor(`usdc:${issuerA}`);
      expect(lowerResult.ok).toBe(true);
      if (!lowerResult.ok) return;
      expect(lowerResult.value.code).toBe("usdc");
      expect(lowerResult.value.canonicalDescriptor).toBe(`usdc:${issuerA}`);
    });

    it("rejects asset codes exceeding 12 characters", () => {
      const result = encodeAssetDescriptor(boundariesFixture.thirteenChars.raw);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("invalid_input");
    });

    it("rejects non-alphanumeric asset codes", () => {
      const result = encodeAssetDescriptor(`USD$:${issuerA}`);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("invalid_input");
    });

    it("rejects secret seeds as issuers without throwing", () => {
      const result = encodeAssetDescriptor(`USDC:${secretSeed}`);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("invalid_issuer");
    });

    it("rejects invalid public key checksums", () => {
      const result = encodeAssetDescriptor(
        "USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLAX"
      );
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("invalid_issuer");
    });
  });

  describe("decodeAssetXdr", () => {
    it("decodes native Asset XDR into canonical native descriptor", () => {
      const result = decodeAssetXdr(nativeFixture.xdr);
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value).toEqual({
        mode: "decode",
        type: "native",
        code: "XLM",
        issuer: null,
        canonicalDescriptor: "native",
        xdr: nativeFixture.xdr,
        json: {
          type: "native",
          code: "XLM",
          issuer: null,
          canonical: "native",
          xdr: nativeFixture.xdr
        }
      });
    });

    it("decodes credit_alphanum4 Asset XDR correctly", () => {
      const result = decodeAssetXdr(credit4Fixture.xdr);
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.type).toBe("credit_alphanum4");
      expect(result.value.code).toBe(credit4Fixture.code);
      expect(result.value.issuer).toBe(credit4Fixture.issuer);
      expect(result.value.canonicalDescriptor).toBe(credit4Fixture.canonicalDescriptor);
    });

    it("decodes credit_alphanum12 Asset XDR correctly", () => {
      const result = decodeAssetXdr(credit12Fixture.xdr);
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.type).toBe("credit_alphanum12");
      expect(result.value.code).toBe(credit12Fixture.code);
      expect(result.value.issuer).toBe(credit12Fixture.issuer);
      expect(result.value.canonicalDescriptor).toBe(credit12Fixture.canonicalDescriptor);
    });

    it("decodes credit asset named XLM without converting to native", () => {
      const result = decodeAssetXdr(creditXlmFixture.xdr);
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.value.type).toBe("credit_alphanum4");
      expect(result.value.code).toBe("XLM");
      expect(result.value.issuer).toBe(issuerA);
      expect(result.value.canonicalDescriptor).toBe(`XLM:${issuerA}`);
    });

    it("rejects XDR with unconsumed trailing bytes", () => {
      const result = decodeAssetXdr(trailingBytesXdrFixture);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("invalid_input");
    });

    it("rejects liquidity pool share discriminant as unsupported_asset_type", () => {
      const result = decodeAssetXdr(poolShareXdrFixture);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("unsupported_asset_type");
    });

    it("rejects empty base64 string", () => {
      const result = decodeAssetXdr("");
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe("empty_input");
    });
  });

  describe("round-trip verification", () => {
    it("round-trips native asset from descriptor to XDR and back", () => {
      const encoded = runAssetDescriptorCodec({ mode: "encode", raw: "native" });
      expect(encoded.ok).toBe(true);
      if (!encoded.ok) return;

      const decoded = runAssetDescriptorCodec({ mode: "decode", raw: encoded.value.xdr });
      expect(decoded.ok).toBe(true);
      if (!decoded.ok) return;

      expect(decoded.value.canonicalDescriptor).toBe("native");
      expect(decoded.value.code).toBe("XLM");
      expect(decoded.value.issuer).toBeNull();
      expect(decoded.value.xdr).toBe(encoded.value.xdr);
    });

    it("round-trips credit_alphanum4 asset descriptor through XDR", () => {
      const encoded = runAssetDescriptorCodec({ mode: "encode", raw: credit4Fixture.raw });
      expect(encoded.ok).toBe(true);
      if (!encoded.ok) return;

      const decoded = runAssetDescriptorCodec({ mode: "decode", raw: encoded.value.xdr });
      expect(decoded.ok).toBe(true);
      if (!decoded.ok) return;

      expect(decoded.value.canonicalDescriptor).toBe(credit4Fixture.canonicalDescriptor);
      expect(decoded.value.code).toBe(credit4Fixture.code);
      expect(decoded.value.issuer).toBe(credit4Fixture.issuer);
      expect(decoded.value.xdr).toBe(encoded.value.xdr);
    });

    it("round-trips credit_alphanum12 asset descriptor through XDR", () => {
      const encoded = runAssetDescriptorCodec({ mode: "encode", raw: credit12Fixture.raw });
      expect(encoded.ok).toBe(true);
      if (!encoded.ok) return;

      const decoded = runAssetDescriptorCodec({ mode: "decode", raw: encoded.value.xdr });
      expect(decoded.ok).toBe(true);
      if (!decoded.ok) return;

      expect(decoded.value.canonicalDescriptor).toBe(credit12Fixture.canonicalDescriptor);
      expect(decoded.value.code).toBe(credit12Fixture.code);
      expect(decoded.value.issuer).toBe(credit12Fixture.issuer);
      expect(decoded.value.xdr).toBe(encoded.value.xdr);
    });
  });
});
