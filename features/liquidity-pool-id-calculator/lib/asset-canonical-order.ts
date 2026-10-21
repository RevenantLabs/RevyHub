import { Asset } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { AssetSpec, CanonicalOrdering, ErrorCode } from "../types";

export function toSdkAsset(spec: AssetSpec): Asset {
  return spec.isNative ? Asset.native() : new Asset(spec.code, spec.issuer as string);
}

/**
 * Orders two assets exactly as the protocol does before hashing — the same
 * rule `Asset.compare` implements, which stellar-core's pool ID derivation
 * requires (assetA strictly less than assetB). Identical assets have no
 * valid ordering and are rejected explicitly.
 */
export function canonicalOrder(x: AssetSpec, y: AssetSpec): Result<CanonicalOrdering, ErrorCode> {
  const comparison = Asset.compare(toSdkAsset(x), toSdkAsset(y));

  if (comparison === 0) return err("identical_assets");
  if (comparison < 0) return ok({ assetA: x, assetB: y, swapped: false });
  return ok({ assetA: y, assetB: x, swapped: true });
}
