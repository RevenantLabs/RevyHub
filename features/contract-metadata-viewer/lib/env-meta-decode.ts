import { err, ok, type Result } from "@/core/result/result"; import type { ContractMetadataViewerErrorCode, EnvVersion } from "@/features/contract-metadata-viewer/types";
export function decodeEnvMeta(payloads: Uint8Array[]): Result<EnvVersion, ContractMetadataViewerErrorCode> {
  const payload = payloads[0]; if (!payload || payload.length < 12) return err("missing_env_meta");
  const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
  if (view.getUint32(0, false) !== 0) return err("missing_env_meta");
  return ok({ protocol: view.getUint32(4, false), preRelease: view.getUint32(8, false) });
}
