import { ok, type Result } from "@/core/result/result";
import type { StellarNetwork } from "@/core/network/types";
import type { ErrorCode, HashReport, LedgerMarker } from "../types";
import { contractCodeKey, decodeCodeEntry, inspectLedgerResult } from "./code-entry";
import { decodeInstance, instanceLedgerKey } from "./contract-instance";
import { readEntries } from "./contractCodeHashVerifier.errors";
import { compareWasm } from "./wasm-hash";

function marker(latestLedger: number, row: { lastModifiedLedgerSeq?: number; liveUntilLedgerSeq?: number }): LedgerMarker {
  return {
    latestLedger,
    lastModifiedLedgerSeq: row.lastModifiedLedgerSeq ?? null,
    liveUntilLedgerSeq: row.liveUntilLedgerSeq ?? null
  };
}

/** Read the instance, then the referenced code, and compare SHA-256 of the Wasm bytes. */
export async function verifyCodeHash(contractId: string, network: StellarNetwork, signal?: AbortSignal): Promise<Result<HashReport, ErrorCode>> {
  const instanceRead = await readEntries([instanceLedgerKey(contractId)], network, signal);
  if (!instanceRead.ok) return instanceRead;
  const instanceRow = inspectLedgerResult(instanceRead.value);
  if (!instanceRow.ok) return instanceRow;
  const decoded = decodeInstance(instanceRow.value.xdr);
  if (!decoded.ok) return decoded;
  const instanceMarker = marker(instanceRead.value.latestLedger, instanceRow.value);
  if (decoded.value.kind === "builtin") {
    return ok({
      contractId,
      network,
      instance: { kind: "builtin", hash: null, marker: instanceMarker },
      code: null,
      verdict: "not_applicable",
      atomic: true
    });
  }
  const codeRead = await readEntries([contractCodeKey(decoded.value.hash)], network, signal);
  if (!codeRead.ok) return codeRead;
  const codeRow = inspectLedgerResult(codeRead.value);
  if (!codeRow.ok) return codeRow;
  const code = decodeCodeEntry(codeRow.value.xdr);
  if (!code.ok) return code;
  const compared = compareWasm(code.value.wasm, decoded.value.hash);
  return ok({
    contractId,
    network,
    instance: { kind: "wasm", hash: compared.expected, marker: instanceMarker },
    code: { size: code.value.wasm.length, hash: compared.actual, marker: marker(codeRead.value.latestLedger, codeRow.value) },
    verdict: compared.equal ? "match" : "mismatch",
    atomic: instanceRead.value.latestLedger === codeRead.value.latestLedger
  });
}
