import { describe, it, expect } from "vitest";
import { formatAssetCode, formatIssuer, formatJsonForDisplay, formatAssetKindLabel } from "@/features/asset-descriptor-codec/lib/format";
import { validIssuer } from "@/features/asset-descriptor-codec/fixtures/assetDescriptor.fixture";

describe("formatAssetCode", () => {
  it("returns XLM for native", () => {
    expect(formatAssetCode({ kind: "native" })).toBe("XLM");
  });
  it("returns code for issued", () => {
    expect(formatAssetCode({ kind: "credit_alphanum4", code: "USD", issuer: validIssuer })).toBe("USD");
  });
});

describe("formatIssuer", () => {
  it("returns null for native", () => {
    expect(formatIssuer({ kind: "native" })).toBeNull();
  });
  it("returns issuer for issued", () => {
    expect(formatIssuer({ kind: "credit_alphanum4", code: "USD", issuer: validIssuer })).toBe(validIssuer);
  });
});

describe("formatJsonForDisplay", () => {
  it("pretty-prints JSON", () => {
    const result = formatJsonForDisplay({ type: "native", assetCode: "XLM" });
    expect(result).toContain("\n");
    expect(result).toContain('"type"');
  });
});

describe("formatAssetKindLabel", () => {
  it("labels native", () => {
    expect(formatAssetKindLabel({ kind: "native" })).toBe("Native (XLM)");
  });
  it("labels alphanum4", () => {
    expect(formatAssetKindLabel({ kind: "credit_alphanum4", code: "USD", issuer: validIssuer })).toBe("Alphanumeric 4");
  });
  it("labels alphanum12", () => {
    expect(formatAssetKindLabel({ kind: "credit_alphanum12", code: "MYTOKEN12345", issuer: validIssuer })).toBe("Alphanumeric 12");
  });
});
