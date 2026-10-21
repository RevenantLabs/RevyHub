import { hash, xdr } from "@stellar/stellar-sdk";
import type { CanonicalOrdering } from "../types";
import { toSdkAsset } from "./asset-canonical-order";

/**
 * Computes the deterministic constant-product pool ID: SHA-256 of the XDR
 * encoding of `LiquidityPoolType::LIQUIDITY_POOL_CONSTANT_PRODUCT` followed
 * by `LiquidityPoolConstantProductParameters { assetA, assetB, fee }` — the
 * same payload stellar-core hashes, assembled here from raw XDR rather than
 * the SDK's `getLiquidityPoolId` convenience wrapper so an arbitrary
 * in-range fee can be computed (see the README).
 */
export function computePoolIdHash(ordering: CanonicalOrdering, feeBps: number): string {
  // The SDK's .d.ts omits `toXDR()` from this specific enum class, though it
  // exists at runtime like every other js-xdr enum (getLiquidityPoolId's own
  // implementation calls it the same way) — the cast works around that gap.
  const poolType = xdr.LiquidityPoolType.liquidityPoolConstantProduct() as unknown as { toXDR(): Buffer };
  const typeXdr = poolType.toXDR();
  const paramsXdr = new xdr.LiquidityPoolConstantProductParameters({
    assetA: toSdkAsset(ordering.assetA).toXDRObject(),
    assetB: toSdkAsset(ordering.assetB).toXDRObject(),
    fee: feeBps
  }).toXDR();

  return hash(Buffer.concat([typeXdr, paramsXdr])).toString("hex");
}
