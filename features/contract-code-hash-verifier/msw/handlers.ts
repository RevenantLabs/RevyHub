import { http, HttpResponse } from "msw";
import { SOROBAN_RPC_URLS } from "@/core/network/config";
import { instanceLedgerKey } from "../lib/contract-instance";
import { contractCodeKey } from "../lib/code-entry";
import { builtinContractId, builtinInstanceXdr } from "../fixtures/builtin-contract.fixture";
import {
  archivedContractId,
  codeXdr,
  contractId,
  instanceXdr,
  malformedContractId,
  mismatchCodeXdr,
  mismatchContractId,
  mismatchDigest,
  mismatchInstanceXdr,
  unavailableContractId,
  wasmDigest
} from "../fixtures/wasm-contract.fixture";

function rpc(result: unknown) {
  return HttpResponse.json({ jsonrpc: "2.0", id: 1, result });
}

interface Row {
  xdr: string;
  latestLedger: number;
  lastModifiedLedgerSeq: number;
  liveUntilLedgerSeq?: number;
}

const rows: Record<string, Row> = {
  [instanceLedgerKey(contractId)]: { xdr: instanceXdr, latestLedger: 400, lastModifiedLedgerSeq: 10 },
  [contractCodeKey(wasmDigest)]: { xdr: codeXdr, latestLedger: 400, lastModifiedLedgerSeq: 20 },
  [instanceLedgerKey(mismatchContractId)]: { xdr: mismatchInstanceXdr, latestLedger: 400, lastModifiedLedgerSeq: 12 },
  [contractCodeKey(mismatchDigest)]: { xdr: mismatchCodeXdr, latestLedger: 401, lastModifiedLedgerSeq: 21 },
  [instanceLedgerKey(builtinContractId)]: { xdr: builtinInstanceXdr, latestLedger: 400, lastModifiedLedgerSeq: 11 },
  [instanceLedgerKey(archivedContractId)]: { xdr: instanceXdr, latestLedger: 400, lastModifiedLedgerSeq: 10, liveUntilLedgerSeq: 1 },
  [instanceLedgerKey(malformedContractId)]: { xdr: "AAAA", latestLedger: 400, lastModifiedLedgerSeq: 10 }
};

export const handlers = [
  http.post(SOROBAN_RPC_URLS.testnet, async ({ request }) => {
    const body = (await request.json()) as { params?: { keys?: string[] } };
    const key = body.params?.keys?.[0] ?? "";
    if (key === instanceLedgerKey(unavailableContractId)) return new HttpResponse(null, { status: 503 });
    const row = rows[key];
    if (!row) return rpc({ entries: [], latestLedger: 400 });
    return rpc({
      entries: [{
        key,
        xdr: row.xdr,
        lastModifiedLedgerSeq: row.lastModifiedLedgerSeq,
        liveUntilLedgerSeq: row.liveUntilLedgerSeq
      }],
      latestLedger: row.latestLedger
    });
  })
];
