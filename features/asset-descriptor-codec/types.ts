export type AssetKind = "native" | "credit_alphanum4" | "credit_alphanum12";

export interface NativeAssetDescriptor {
  kind: "native";
}

export interface IssuedAssetDescriptor {
  kind: "credit_alphanum4" | "credit_alphanum12";
  code: string;
  issuer: string;
}

export type AssetDescriptor = NativeAssetDescriptor | IssuedAssetDescriptor;

export interface AssetXdrData {
  xdr: string;
}

export interface AssetDescriptorResult {
  descriptor: AssetDescriptor;
  canonical: string;
  json: AssetDescriptorJson;
  xdr: string;
}

export type AssetDescriptorJson =
  | { type: "native"; assetCode: "XLM" }
  | { type: "credit_alphanum4" | "credit_alphanum12"; assetCode: string; issuer: string };

export interface DecodeXdrResult {
  descriptor: AssetDescriptor;
  canonical: string;
  json: AssetDescriptorJson;
  xdr: string;
}

export type AssetDescriptorErrorCode =
  | "empty_input"
  | "invalid_asset_code"
  | "invalid_issuer"
  | "invalid_xdr"
  | "unsupported_asset_type";
