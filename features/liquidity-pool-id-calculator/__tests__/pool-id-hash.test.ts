import { describe, expect, it } from "vitest";
import { getLiquidityPoolId, Asset, Keypair } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { computePoolIdHash } from "../lib/pool-id-hash";
import type { AssetSpec } from "../types";

const native: AssetSpec = { isNative: true, code: "native", issuer: null, display: "native" };
const issuerId = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9)).publicKey();
const issued: AssetSpec = { isNative: false, code: "USDC", issuer: issuerId, display: `USDC:${issuerId}` };

describe("computePoolIdHash", () => {
  it("matches the SDK's own getLiquidityPoolId at the one fee it supports (30 bps)", () => {
    const expected = getLiquidityPoolId("constant_product", {
      assetA: Asset.native(),
      assetB: new Asset("USDC", issuerId),
      fee: 30
    }).toString("hex");

    const actual = computePoolIdHash({ assetA: native, assetB: issued, swapped: false }, 30);
    expect(actual).toBe(expected);
  });

  it("is a 64-character hex string", () => {
    const result = computePoolIdHash({ assetA: native, assetB: issued, swapped: false }, 100);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for the same inputs", () => {
    const first = computePoolIdHash({ assetA: native, assetB: issued, swapped: false }, 30);
    const second = computePoolIdHash({ assetA: native, assetB: issued, swapped: false }, 30);
    expect(first).toBe(second);
  });

  it("changes when the fee changes", () => {
    const at30 = computePoolIdHash({ assetA: native, assetB: issued, swapped: false }, 30);
    const at100 = computePoolIdHash({ assetA: native, assetB: issued, swapped: false }, 100);
    expect(at30).not.toBe(at100);
  });
});
