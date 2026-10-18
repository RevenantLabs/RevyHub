import type { AssetIdentity } from "@/features/offer-liability-headroom/types";

interface HorizonAssetFields {
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
}

/** Normalize Horizon offer/balance asset fields into a stable identity key. */
export function normalizeOfferAsset(fields: HorizonAssetFields): AssetIdentity | null {
  const assetType = fields.asset_type?.trim();
  if (!assetType) return null;

  if (assetType === "native") {
    return { kind: "native", key: "native", label: "XLM (native)" };
  }

  if (assetType === "liquidity_pool_shares") return null;

  const code = fields.asset_code?.trim();
  const issuer = fields.asset_issuer?.trim();
  if (!code || !issuer || !/^[A-Za-z0-9]{1,12}$/.test(code) || !/^G[A-Z0-9]{55}$/.test(issuer)) {
    return null;
  }

  const normalizedCode = code.toUpperCase();
  return {
    kind: "credit",
    key: `${normalizedCode}:${issuer}`,
    code: normalizedCode,
    issuer,
    label: `${normalizedCode}:${issuer.slice(0, 4)}…${issuer.slice(-4)}`
  };
}

export function assetKeyFromSellingBuying(
  assetType: string | undefined,
  assetCode: string | undefined,
  assetIssuer: string | undefined
): AssetIdentity | null {
  return normalizeOfferAsset({
    asset_type: assetType,
    asset_code: assetCode,
    asset_issuer: assetIssuer
  });
}
