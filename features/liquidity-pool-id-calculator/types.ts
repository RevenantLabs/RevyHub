export type ErrorCode = "identical_assets" | "invalid_fee" | "invalid_asset";

export interface RawInput {
  assetXCode: string;
  assetXIssuer: string;
  assetYCode: string;
  assetYIssuer: string;
  feeBps: string;
}

export interface AssetSpec {
  isNative: boolean;
  code: string;
  issuer: string | null;
  display: string;
}

export interface ParsedInput {
  assetX: AssetSpec;
  assetY: AssetSpec;
  feeBps: number;
}

export interface CanonicalOrdering {
  assetA: AssetSpec;
  assetB: AssetSpec;
  /** True when the input order did not already match the canonical order. */
  swapped: boolean;
}

export interface LiquidityPoolIdResult {
  poolIdHex: string;
  ordering: CanonicalOrdering;
  feeBps: number;
}
