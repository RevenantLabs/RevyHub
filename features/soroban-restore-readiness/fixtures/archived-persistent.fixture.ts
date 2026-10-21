import { nativeToScVal, StrKey } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { latestLedger } from "./sorobanRestoreReadiness.fixture";

export const archivedContractId = StrKey.encodeContract(Buffer.alloc(32, 32));
export const archivedStorageKeyXdr = nativeToScVal("ledger", { type: "symbol" }).toXDR("base64");

/**
 * Models the hot-archive response shape for a persistent entry: the row is
 * present with its last known modification ledger, but carries no current
 * `liveUntilLedgerSeq` — there is no live TTL left to report.
 */
export const archivedRow = {
  xdr: "AAAAAA==",
  lastModifiedLedgerSeq: latestLedger - 900_000
};
