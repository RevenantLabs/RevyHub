import type { AssetMetadataErrorCode } from "@/features/asset-metadata/types";

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : (error as Error | undefined)?.name === "AbortError";
}

/**
 * A browser cannot distinguish "host does not exist" from "host refused CORS":
 * both arrive as the same opaque TypeError. They are reported together as
 * `network_error`, and the copy says so rather than guessing.
 */
export function toAssetMetadataErrorCode(error: unknown): AssetMetadataErrorCode {
  if (isAbortError(error)) return "timeout";
  return "network_error";
}
