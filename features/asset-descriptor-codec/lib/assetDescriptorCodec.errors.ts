import type { AssetDescriptorCodecErrorCode } from "@/features/asset-descriptor-codec/types";

/**
 * Maps unexpected runtime errors or unhandled exceptions to a contract error code.
 */
export function toAssetDescriptorCodecErrorCode(error: unknown): AssetDescriptorCodecErrorCode {
  if (!error) {
    return "invalid_input";
  }

  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (message.includes("large") || message.includes("overflow") || message.includes("bound")) {
    return "input_too_large";
  }

  if (message.includes("issuer") || message.includes("account") || message.includes("checksum")) {
    return "invalid_issuer";
  }

  if (message.includes("pool") || message.includes("unsupported") || message.includes("switch")) {
    return "unsupported_asset_type";
  }

  if (message.includes("empty")) {
    return "empty_input";
  }

  return "invalid_input";
}
