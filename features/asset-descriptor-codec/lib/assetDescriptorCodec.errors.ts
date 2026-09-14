import type { AssetDescriptorErrorCode } from "@/features/asset-descriptor-codec/types";

export interface AssetDescriptorError {
  code: AssetDescriptorErrorCode;
}

export function isAssetDescriptorError(e: unknown): e is AssetDescriptorError {
  return typeof e === "object" && e !== null && "code" in e;
}
