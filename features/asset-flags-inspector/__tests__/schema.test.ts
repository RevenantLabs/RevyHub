import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { parseAssetFlagsInspectorInput } from "@/features/asset-flags-inspector/schema";
import { issuerId } from "@/features/asset-flags-inspector/fixtures/assetFlagsInspector.fixture";

describe("parseAssetFlagsInspectorInput", () => {
  it("rejects empty input", () => {
    const result = parseAssetFlagsInspectorInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("strips internal whitespace from pasted addresses", () => {
    const spaced = `${issuerId.slice(0, 10)} ${issuerId.slice(10)}`;
    const result = parseAssetFlagsInspectorInput(spaced);
    expect(result.ok && result.value.issuerId).toBe(issuerId);
  });

  it("rejects an invalid checksum", () => {
    const result = parseAssetFlagsInspectorInput("GNOPE");
    expect(result).toEqual({ ok: false, code: "invalid_address" });
  });

  it("accepts a valid issuer address", () => {
    const result = parseAssetFlagsInspectorInput(issuerId);
    expect(result).toEqual({ ok: true, value: { issuerId } });
  });

  it("rejects secret seeds", () => {
    const secret = Keypair.random().secret();
    const result = parseAssetFlagsInspectorInput(secret);
    expect(result).toEqual({ ok: false, code: "invalid_address" });
  });
});
