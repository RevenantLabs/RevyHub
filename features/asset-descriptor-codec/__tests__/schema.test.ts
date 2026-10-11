import { describe, it, expect } from "vitest";
import { parseAssetDescriptorInput } from "@/features/asset-descriptor-codec/schema";
import { validIssuer } from "@/features/asset-descriptor-codec/fixtures/assetDescriptor.fixture";

describe("parseAssetDescriptorInput", () => {
  it("accepts XLM as native", () => {
    const result = parseAssetDescriptorInput("XLM");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.mode).toBe("native");
    }
  });

  it("accepts lowercase xlm", () => {
    const result = parseAssetDescriptorInput("xlm");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.mode).toBe("native");
    }
  });

  it("accepts CODE:ISSUER format", () => {
    const result = parseAssetDescriptorInput(`USD:${validIssuer}`);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.mode).toBe("issued");
    }
  });

  it("rejects empty input", () => {
    expect(parseAssetDescriptorInput("").ok).toBe(false);
    expect(parseAssetDescriptorInput("   ").ok).toBe(false);
  });

  it("rejects invalid asset code", () => {
    const result = parseAssetDescriptorInput(`INVALIDCODE123456:${validIssuer}`);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("invalid_asset_code");
    }
  });

  it("rejects invalid issuer", () => {
    const result = parseAssetDescriptorInput("USD:not-a-valid-address");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("invalid_issuer");
    }
  });

  it("rejects code without issuer", () => {
    const result = parseAssetDescriptorInput("USD");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("invalid_issuer");
    }
  });

  it("detects XDR by length and no colon", () => {
    const longBase64 = "AAAAAAABBBBBBCCCCCCDDDDDDAAAAAAABBBBBBCCCCCC";
    const result = parseAssetDescriptorInput(longBase64);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.mode).toBe("xdr");
    }
  });
});
