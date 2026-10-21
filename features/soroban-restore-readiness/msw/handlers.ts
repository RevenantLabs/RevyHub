import { Address, xdr } from "@stellar/stellar-sdk";
import { http, HttpResponse } from "msw";
import { SOROBAN_RPC_URLS } from "@/core/network/config";
import {
  historyUnavailableContractId,
  latestLedger,
  liveContractId,
  liveRow,
  notFoundContractId,
  pendingEvictionContractId,
  pendingEvictionRow,
  storageKeyXdr,
  unavailableContractId
} from "../fixtures/sorobanRestoreReadiness.fixture";
import { archivedContractId, archivedRow, archivedStorageKeyXdr } from "../fixtures/archived-persistent.fixture";
import {
  expiredTemporaryContractId,
  expiredTemporaryStorageKeyXdr,
  latestLedgerAtExpiry
} from "../fixtures/expired-temporary.fixture";

function ledgerKey(contractId: string, keyXdr: string, durability: "persistent" | "temporary"): string {
  return xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: new Address(contractId).toScAddress(),
      key: xdr.ScVal.fromXDR(keyXdr, "base64"),
      durability: durability === "temporary" ? xdr.ContractDataDurability.temporary() : xdr.ContractDataDurability.persistent()
    })
  ).toXDR("base64");
}

function rpcResult(result: unknown) {
  return HttpResponse.json({ jsonrpc: "2.0", id: 1, result });
}

function rpcError(code: number, message: string) {
  return HttpResponse.json({ jsonrpc: "2.0", id: 1, error: { code, message } });
}

const rows: Record<string, { entries: unknown[]; latestLedger: number }> = {
  [ledgerKey(liveContractId, storageKeyXdr, "persistent")]: { entries: [liveRow], latestLedger },
  [ledgerKey(pendingEvictionContractId, storageKeyXdr, "persistent")]: { entries: [pendingEvictionRow], latestLedger },
  [ledgerKey(notFoundContractId, storageKeyXdr, "persistent")]: { entries: [], latestLedger },
  [ledgerKey(archivedContractId, archivedStorageKeyXdr, "persistent")]: { entries: [archivedRow], latestLedger },
  [ledgerKey(expiredTemporaryContractId, expiredTemporaryStorageKeyXdr, "temporary")]: {
    entries: [],
    latestLedger: latestLedgerAtExpiry
  }
};

/** Request mocks used by this slice's tests. */
export const handlers = [
  http.post(SOROBAN_RPC_URLS.testnet, async ({ request }) => {
    const body = (await request.json()) as { params?: { keys?: string[] } };
    const key = body.params?.keys?.[0] ?? "";

    if (key === ledgerKey(unavailableContractId, storageKeyXdr, "persistent")) {
      return new HttpResponse(null, { status: 429 });
    }
    if (key === ledgerKey(historyUnavailableContractId, storageKeyXdr, "persistent")) {
      return rpcError(-32000, "ledger entry history is not available for the requested range");
    }

    const row = rows[key];
    if (!row) return rpcResult({ entries: [], latestLedger });
    return rpcResult(row);
  })
];
