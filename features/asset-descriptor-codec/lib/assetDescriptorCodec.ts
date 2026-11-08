import { Asset, StrKey, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { ASSET_CODE_PATTERN } from "@/features/asset-descriptor-codec/schema";
import type {
  AssetDescriptorCodecErrorCode,
  AssetDescriptorCodecInput,
  AssetDescriptorCodecResult,
  AssetType,
  StructuredAssetJson
} from "@/features/asset-descriptor-codec/types";

/**
 * Encodes a validated asset descriptor string into its canonical text,
 * structured JSON, and base64 Asset XDR representation.
 */
export function encodeAssetDescriptor(
  raw: string
): Result<AssetDescriptorCodecResult, AssetDescriptorCodecErrorCode> {
  if (raw === "native" || raw === "XLM") {
    const nativeAsset = Asset.native();
    const xdrBase64 = nativeAsset.toXDRObject().toXDR("base64");
    const json: StructuredAssetJson = {
      type: "native",
      code: "XLM",
      issuer: null,
      canonical: "native",
      xdr: xdrBase64
    };

    return ok({
      mode: "encode",
      type: "native",
      code: "XLM",
      issuer: null,
      canonicalDescriptor: "native",
      xdr: xdrBase64,
      json
    });
  }

  const separatorIndex = raw.indexOf(":");
  if (separatorIndex === -1) {
    return err("invalid_input");
  }

  const code = raw.slice(0, separatorIndex).trim();
  const issuer = raw.slice(separatorIndex + 1).trim();

  if (!code || !ASSET_CODE_PATTERN.test(code)) {
    return err("invalid_input");
  }

  if (!issuer || /^S/i.test(issuer) || !StrKey.isValidEd25519PublicKey(issuer)) {
    return err("invalid_issuer");
  }

  let assetType: AssetType;
  if (code.length >= 1 && code.length <= 4) {
    assetType = "credit_alphanum4";
  } else if (code.length >= 5 && code.length <= 12) {
    assetType = "credit_alphanum12";
  } else {
    return err("invalid_input");
  }

  const issuedAsset = new Asset(code, issuer);
  const canonicalDescriptor = `${code}:${issuer}`;
  const xdrBase64 = issuedAsset.toXDRObject().toXDR("base64");
  const json: StructuredAssetJson = {
    type: assetType,
    code,
    issuer,
    canonical: canonicalDescriptor,
    xdr: xdrBase64
  };

  return ok({
    mode: "encode",
    type: assetType,
    code,
    issuer,
    canonicalDescriptor,
    xdr: xdrBase64,
    json
  });
}

/**
 * Decodes a base64 Stellar Asset XDR payload strictly ensuring that only
 * canonical classic Asset variants (native, alphanum4, alphanum12) are accepted.
 *
 * Rejects trailing unconsumed bytes, pool shares, and unsupported discriminants.
 */
export function decodeAssetXdr(
  rawXdr: string
): Result<AssetDescriptorCodecResult, AssetDescriptorCodecErrorCode> {
  const compact = rawXdr.replace(/\s+/g, "");
  if (!compact) {
    return err("empty_input");
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(compact, "base64");
  } catch {
    return err("invalid_input");
  }

  if (buffer.length < 4) {
    return err("invalid_input");
  }

  const discriminant = buffer.readInt32BE(0);
  if (discriminant < 0 || discriminant > 2) {
    return err("unsupported_asset_type");
  }

  let parsedXdrAsset: xdr.Asset;
  try {
    parsedXdrAsset = xdr.Asset.fromXDR(compact, "base64");
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("source buffer not entirely consumed") || message.includes("unconsumed")) {
      return err("invalid_input");
    }
    if (message.includes("Bad union switch") || message.includes("unsupported")) {
      return err("unsupported_asset_type");
    }
    return err("invalid_input");
  }

  const switchName = parsedXdrAsset.switch().name;

  if (switchName === "assetTypeNative") {
    const json: StructuredAssetJson = {
      type: "native",
      code: "XLM",
      issuer: null,
      canonical: "native",
      xdr: compact
    };

    return ok({
      mode: "decode",
      type: "native",
      code: "XLM",
      issuer: null,
      canonicalDescriptor: "native",
      xdr: compact,
      json
    });
  }

  if (switchName === "assetTypeCreditAlphanum4" || switchName === "assetTypeCreditAlphanum12") {
    const stellarAsset = Asset.fromOperation(parsedXdrAsset);
    const code = stellarAsset.getCode();
    const issuer = stellarAsset.getIssuer();
    const assetType = stellarAsset.getAssetType() as AssetType;
    const canonicalDescriptor = `${code}:${issuer}`;

    const json: StructuredAssetJson = {
      type: assetType,
      code,
      issuer,
      canonical: canonicalDescriptor,
      xdr: compact
    };

    return ok({
      mode: "decode",
      type: assetType,
      code,
      issuer,
      canonicalDescriptor,
      xdr: compact,
      json
    });
  }

  return err("unsupported_asset_type");
}

/**
 * Main domain entrypoint executing encode or decode logic based on input mode.
 */
export function runAssetDescriptorCodec(
  input: AssetDescriptorCodecInput
): Result<AssetDescriptorCodecResult, AssetDescriptorCodecErrorCode> {
  if (input.mode === "encode") {
    return encodeAssetDescriptor(input.raw);
  }
  return decodeAssetXdr(input.raw);
}
