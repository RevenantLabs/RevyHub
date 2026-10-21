import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { canonicalOrder } from "../lib/asset-canonical-order";
import type { AssetSpec } from "../types";

const issuerId = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 14)).publicKey();
const native: AssetSpec = { isNative: true, code: "native", issuer: null, display: "native" };
const issued: AssetSpec = { isNative: false, code: "USDC", issuer: issuerId, display: `USDC:${issuerId}` };

describe("canonicalOrder", () => {
  it("orders native before an issued asset (native sorts first)", () => {
    const result = canonicalOrder(issued, native);
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.assetA).toEqual(native);
    expect(result.ok && result.value.assetB).toEqual(issued);
    expect(result.ok && result.value.swapped).toBe(true);
  });

  it("reports swapped: false when the input was already in canonical order", () => {
    const result = canonicalOrder(native, issued);
    expect(result.ok && result.value.swapped).toBe(false);
  });

  it("rejects identical assets", () => {
    const result = canonicalOrder(native, native);
    expect(!result.ok && result.code).toBe("identical_assets");
  });
});
