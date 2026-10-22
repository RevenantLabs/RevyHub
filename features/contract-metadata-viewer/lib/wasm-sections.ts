import { err, ok, type Result } from "@/core/result/result"; import type { ContractMetadataViewerErrorCode } from "@/features/contract-metadata-viewer/types";
function uleb(bytes: Uint8Array, start: number): { value: number; next: number } | null { let value = 0; let shift = 0; for (let offset = start; offset < bytes.length && shift < 35; offset++, shift += 7) { const byte = bytes[offset]!; value |= (byte & 0x7f) << shift; if (!(byte & 0x80)) return { value, next: offset + 1 }; } return null; }
export function customSections(wasm: Uint8Array): Result<Map<string, Uint8Array[]>, ContractMetadataViewerErrorCode> {
  if (wasm.length < 8 || wasm[0] !== 0 || wasm[1] !== 97 || wasm[2] !== 115 || wasm[3] !== 109) return err("request_failed");
  const sections = new Map<string, Uint8Array[]>(); let offset = 8;
  while (offset < wasm.length) { const id = wasm[offset++]!; const size = uleb(wasm, offset); if (!size) return err("request_failed"); offset = size.next; const end = offset + size.value; if (end > wasm.length) return err("request_failed");
    if (id === 0) { const length = uleb(wasm, offset); if (!length || length.next + length.value > end) return err("request_failed"); const name = new TextDecoder().decode(wasm.slice(length.next, length.next + length.value)); const payload = wasm.slice(length.next + length.value, end); sections.set(name, [...(sections.get(name) ?? []), payload]); }
    offset = end;
  }
  return ok(sections);
}
