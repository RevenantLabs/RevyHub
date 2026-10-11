import { Asset, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  AssetDescriptor,
  AssetDescriptorErrorCode,
  AssetDescriptorJson,
  AssetDescriptorResult,
  DecodeXdrResult,
  IssuedAssetDescriptor,
  NativeAssetDescriptor,
} from "@/features/asset-descriptor-codec/types";

export function descriptorToJson(descriptor: AssetDescriptor): AssetDescriptorJson {
  if (descriptor.kind === "native") {
    return { type: "native", assetCode: "XLM" };
  }
  return { type: descriptor.kind, assetCode: descriptor.code, issuer: descriptor.issuer };
}

export function descriptorToCanonical(descriptor: AssetDescriptor): string {
  if (descriptor.kind === "native") return "XLM";
  return `${descriptor.code}:${descriptor.issuer}`;
}

export function encodeAssetDescriptor(
  descriptor: AssetDescriptor
): Result<AssetDescriptorResult, AssetDescriptorErrorCode> {
  try {
    const asset = descriptorToAsset(descriptor);
    const xdrObj = asset.toXDRObject();
    const xdrBuffer = xdrObj.toXDR();
    const xdrBase64 = xdrBuffer.toString("base64");

    return ok({
      descriptor,
      canonical: descriptorToCanonical(descriptor),
      json: descriptorToJson(descriptor),
      xdr: xdrBase64,
    });
  } catch {
    return err("unsupported_asset_type");
  }
}

export function decodeAssetXdr(
  xdrBase64: string
): Result<DecodeXdrResult, AssetDescriptorErrorCode> {
  try {
    const xdrBuffer = Buffer.from(xdrBase64, "base64");
    const assetXdr = xdr.Asset.fromXDR(xdrBuffer);
    const asset = Asset.fromOperation(assetXdr);
    const descriptor = assetToDescriptor(asset);

    return ok({
      descriptor,
      canonical: descriptorToCanonical(descriptor),
      json: descriptorToJson(descriptor),
      xdr: xdrBase64,
    });
  } catch {
    return err("invalid_xdr");
  }
}

function descriptorToAsset(descriptor: AssetDescriptor): Asset {
  if (descriptor.kind === "native") {
    return Asset.native();
  }
  return new Asset(descriptor.code, descriptor.issuer);
}

function assetToDescriptor(asset: Asset): AssetDescriptor {
  if (asset.isNative()) {
    return { kind: "native" } satisfies NativeAssetDescriptor;
  }
  const code = asset.getCode();
  const issuer = asset.getIssuer();
  const kind = code.length <= 4 ? "credit_alphanum4" : "credit_alphanum12";
  return { kind, code, issuer } satisfies IssuedAssetDescriptor;
}
