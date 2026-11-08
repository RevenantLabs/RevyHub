import type {
  AssetType,
  CodecMode,
  StructuredAssetJson
} from "@/features/asset-descriptor-codec/types";

/**
 * Returns a human-friendly label for an asset variant.
 */
export function formatAssetType(type: AssetType): string {
  switch (type) {
    case "native":
      return "Native (XLM)";
    case "credit_alphanum4":
      return "Alphanum 4 (1-4 chars)";
    case "credit_alphanum12":
      return "Alphanum 12 (5-12 chars)";
  }
}

/**
 * Pretty-prints structured JSON for user display.
 */
export function formatJson(data: StructuredAssetJson): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Formats the codec operation mode for status summaries.
 */
export function formatMode(mode: CodecMode): string {
  return mode === "encode" ? "Encoded from descriptor" : "Decoded from XDR";
}

/**
 * Formats the asset issuer account, displaying a fallback for native assets.
 */
export function formatIssuerDisplay(issuer: string | null): string {
  return issuer ?? "None (native asset)";
}
