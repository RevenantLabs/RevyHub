import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { parseRegulatedAssetInspectorInput } from "@/features/regulated-asset-inspector/schema";
import { issuerId } from "@/features/regulated-asset-inspector/fixtures/regulatedAssetInspector.fixture";

describe("parseRegulatedAssetInspectorInput", () => {
  it("accepts a public issuer and asset code", () => {
    expect(parseRegulatedAssetInspectorInput({ issuerId, assetCode: "usdc" })).toEqual({
      ok: true,
      value: { issuerId, assetCode: "USDC" }
    });
  });

  it("rejects a secret seed before any request", () => {
    const secret = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9)).secret();
    expect(parseRegulatedAssetInspectorInput({ issuerId: secret, assetCode: "USDC" })).toEqual({
      ok: false,
      code: "invalid_account"
    });
  });

  it("rejects an empty or oversized asset code", () => {
    expect(parseRegulatedAssetInspectorInput({ issuerId, assetCode: "" }).ok).toBe(false);
    expect(parseRegulatedAssetInspectorInput({ issuerId, assetCode: "TOOLONGASSET1" })).toEqual({
      ok: false,
      code: "invalid_asset_code"
    });
  });
});
