import { describe, expect, it } from "vitest";
import {
  formatAssetType,
  formatIssuerDisplay,
  formatJson,
  formatMode
} from "@/features/asset-descriptor-codec/lib/format";
import { issuerA } from "@/features/asset-descriptor-codec/fixtures/assetDescriptorCodec.fixture";

describe("format helpers", () => {
  it("formats asset variants into descriptive labels", () => {
    expect(formatAssetType("native")).toBe("Native (XLM)");
    expect(formatAssetType("credit_alphanum4")).toBe("Alphanum 4 (1-4 chars)");
    expect(formatAssetType("credit_alphanum12")).toBe("Alphanum 12 (5-12 chars)");
  });

  it("formats structured JSON nicely", () => {
    const json = {
      type: "native" as const,
      code: "XLM",
      issuer: null,
      canonical: "native",
      xdr: "AAAAAA=="
    };
    const formatted = formatJson(json);
    expect(formatted).toContain('"canonical": "native"');
    expect(formatted).toContain('"code": "XLM"');
  });

  it("formats operation mode descriptions", () => {
    expect(formatMode("encode")).toBe("Encoded from descriptor");
    expect(formatMode("decode")).toBe("Decoded from XDR");
  });

  it("formats issuer account or native fallback", () => {
    expect(formatIssuerDisplay(null)).toBe("None (native asset)");
    expect(formatIssuerDisplay(issuerA)).toBe(issuerA);
  });
});
