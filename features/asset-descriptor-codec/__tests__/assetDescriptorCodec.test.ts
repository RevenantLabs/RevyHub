import { describe, it, expect } from "vitest";
import {
  encodeAssetDescriptor,
  decodeAssetXdr,
  descriptorToCanonical,
  descriptorToJson,
} from "@/features/asset-descriptor-codec/lib/assetDescriptorCodec";
import { validIssuer } from "@/features/asset-descriptor-codec/fixtures/assetDescriptor.fixture";

describe("encodeAssetDescriptor", () => {
  it("encodes native XLM asset", () => {
    const result = encodeAssetDescriptor({ kind: "native" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.canonical).toBe("XLM");
      expect(result.value.json).toEqual({ type: "native", assetCode: "XLM" });
      expect(result.value.xdr).toBeTruthy();
    }
  });

  it("encodes issued asset with short code", () => {
    const result = encodeAssetDescriptor({ kind: "credit_alphanum4", code: "USD", issuer: validIssuer });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.canonical).toBe(`USD:${validIssuer}`);
      expect(result.value.json.type).toBe("credit_alphanum4");
    }
  });

  it("encodes issued asset with long code", () => {
    const result = encodeAssetDescriptor({ kind: "credit_alphanum12", code: "MYTOKEN12345", issuer: validIssuer });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.json.type).toBe("credit_alphanum12");
    }
  });
});

describe("decodeAssetXdr", () => {
  it("roundtrips native asset XDR", () => {
    const encoded = encodeAssetDescriptor({ kind: "native" });
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;

    const decoded = decodeAssetXdr(encoded.value.xdr);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.value.canonical).toBe("XLM");
      expect(decoded.value.descriptor.kind).toBe("native");
    }
  });

  it("roundtrips issued asset XDR", () => {
    const original = { kind: "credit_alphanum4" as const, code: "USD", issuer: validIssuer };
    const encoded = encodeAssetDescriptor(original);
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;

    const decoded = decodeAssetXdr(encoded.value.xdr);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.value.canonical).toBe(`USD:${validIssuer}`);
      expect(decoded.value.descriptor.kind).toBe("credit_alphanum4");
    }
  });

  it("rejects invalid XDR", () => {
    const result = decodeAssetXdr("not-valid-base64!!!");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("invalid_xdr");
    }
  });

  it("rejects empty XDR", () => {
    const result = decodeAssetXdr("");
    expect(result.ok).toBe(false);
  });
});

describe("descriptorToCanonical", () => {
  it("returns XLM for native", () => {
    expect(descriptorToCanonical({ kind: "native" })).toBe("XLM");
  });

  it("returns CODE:ISSUER for issued", () => {
    expect(descriptorToCanonical({ kind: "credit_alphanum4", code: "ABC", issuer: validIssuer })).toBe(`ABC:${validIssuer}`);
  });
});

describe("descriptorToJson", () => {
  it("formats native as JSON", () => {
    expect(descriptorToJson({ kind: "native" })).toEqual({ type: "native", assetCode: "XLM" });
  });

  it("formats issued as JSON", () => {
    const json = descriptorToJson({ kind: "credit_alphanum4", code: "USD", issuer: validIssuer });
    expect(json).toEqual({ type: "credit_alphanum4", assetCode: "USD", issuer: validIssuer });
  });
});
