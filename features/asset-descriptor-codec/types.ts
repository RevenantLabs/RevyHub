/** Operation mode for the asset codec. */
export type CodecMode = "encode" | "decode";

/** Supported classic Stellar asset variants. */
export type AssetType = "native" | "credit_alphanum4" | "credit_alphanum12";

/** Normalized and validated input ready for the codec domain logic. */
export interface AssetDescriptorCodecInput {
  mode: CodecMode;
  raw: string;
}

/** Structured JSON representation of a decoded or encoded asset. */
export interface StructuredAssetJson {
  type: AssetType;
  code: string;
  issuer: string | null;
  canonical: string;
  xdr: string;
}

/** Complete output payload produced by the codec. */
export interface AssetDescriptorCodecResult {
  mode: CodecMode;
  type: AssetType;
  code: string;
  issuer: string | null;
  canonicalDescriptor: string;
  xdr: string;
  json: StructuredAssetJson;
}

/** Error codes defined by the feature contract for asset descriptor codec operations. */
export type AssetDescriptorCodecErrorCode =
  | "empty_input"
  | "invalid_input"
  | "input_too_large"
  | "invalid_issuer"
  | "unsupported_asset_type";
