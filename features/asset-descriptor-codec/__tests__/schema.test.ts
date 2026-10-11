import { describe, expect, it } from "vitest";
import {
  MAX_INPUT_LENGTH,
  parseAssetDescriptorCodecInput
} from "@/features/asset-descriptor-codec/schema";
import {
  credit4Fixture,
  issuerA,
  nativeFixture,
  secretSeed
} from "@/features/asset-descriptor-codec/fixtures/assetDescriptorCodec.fixture";

describe("parseAssetDescriptorCodecInput", () => {
  it("parses valid native asset descriptor", () => {
    const result = parseAssetDescriptorCodecInput("native");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({ mode: "encode", raw: "native" });
  });

  it("parses XLM alias as native encode input", () => {
    const result = parseAssetDescriptorCodecInput("XLM");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({ mode: "encode", raw: "native" });
  });

  it("parses valid credit asset descriptor", () => {
    const result = parseAssetDescriptorCodecInput(credit4Fixture.raw);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({ mode: "encode", raw: credit4Fixture.raw });
  });

  it("parses JSON structured input for native asset", () => {
    const result = parseAssetDescriptorCodecInput('{"type":"native"}');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({ mode: "encode", raw: "native" });
  });

  it("parses JSON structured input for issued asset", () => {
    const result = parseAssetDescriptorCodecInput(
      JSON.stringify({ code: "USDC", issuer: issuerA })
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({ mode: "encode", raw: `USDC:${issuerA}` });
  });

  it("parses decode mode input with valid base64", () => {
    const result = parseAssetDescriptorCodecInput({
      mode: "decode",
      value: nativeFixture.xdr
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({ mode: "decode", raw: nativeFixture.xdr });
  });

  it("returns empty_input for empty or whitespace-only inputs", () => {
    expect(parseAssetDescriptorCodecInput("").ok).toBe(false);
    expect(parseAssetDescriptorCodecInput("   ").ok).toBe(false);
    expect(parseAssetDescriptorCodecInput({ mode: "decode", value: "" }).ok).toBe(false);
  });

  it("returns input_too_large when input exceeds maximum character limit", () => {
    const oversized = "A".repeat(MAX_INPUT_LENGTH + 1);
    const result = parseAssetDescriptorCodecInput(oversized);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("input_too_large");
  });

  it("returns invalid_issuer when secret seed is provided as issuer", () => {
    const result = parseAssetDescriptorCodecInput(`USDC:${secretSeed}`);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_issuer");
  });

  it("returns invalid_input when raw input itself is a secret seed", () => {
    const result = parseAssetDescriptorCodecInput(secretSeed);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_input");
  });

  it("returns invalid_input for non-base64 input in decode mode", () => {
    const result = parseAssetDescriptorCodecInput({
      mode: "decode",
      value: "Malformed-Base64!!!"
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_input");
  });
});
