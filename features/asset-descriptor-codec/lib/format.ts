import type { AssetDescriptor, AssetDescriptorJson } from "@/features/asset-descriptor-codec/types";

export function formatAssetCode(descriptor: AssetDescriptor): string {
  return descriptor.kind === "native" ? "XLM" : descriptor.code;
}

export function formatIssuer(descriptor: AssetDescriptor): string | null {
  return descriptor.kind === "native" ? null : descriptor.issuer;
}

export function formatJsonForDisplay(json: AssetDescriptorJson): string {
  return JSON.stringify(json, null, 2);
}

export function formatAssetKindLabel(descriptor: AssetDescriptor): string {
  switch (descriptor.kind) {
    case "native":
      return "Native (XLM)";
    case "credit_alphanum4":
      return "Alphanumeric 4";
    case "credit_alphanum12":
      return "Alphanumeric 12";
  }
}
