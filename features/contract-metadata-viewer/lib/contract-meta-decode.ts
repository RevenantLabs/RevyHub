import { err, ok, type Result } from "@/core/result/result"; import type { ContractMetadataViewerErrorCode, MetadataEntry } from "@/features/contract-metadata-viewer/types";
function readString(bytes: Uint8Array, offset: number): { value: string; next: number } | null {
  if (offset + 4 > bytes.length) return null; const length = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, false);
  const start = offset + 4; const padded = Math.ceil(length / 4) * 4; if (start + padded > bytes.length) return null;
  return { value: new TextDecoder("utf-8", { fatal: true }).decode(bytes.slice(start, start + length)), next: start + padded };
}
export function decodeContractMeta(payloads: Uint8Array[]): Result<MetadataEntry[], ContractMetadataViewerErrorCode> {
  const entries: MetadataEntry[] = [];
  try {
    for (const payload of payloads) { let offset = 0; while (offset < payload.length) {
      if (offset + 4 > payload.length || new DataView(payload.buffer, payload.byteOffset, payload.byteLength).getUint32(offset, false) !== 0) return err("request_failed");
      const key = readString(payload, offset + 4); if (!key) return err("request_failed"); const value = readString(payload, key.next); if (!value) return err("request_failed");
      entries.push({ key: key.value, value: value.value }); offset = value.next;
    }}
    return ok(entries);
  } catch { return err("request_failed"); }
}
