import { nativeToScVal, StrKey } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";

export const latestLedger = 1_000_000;

export const storageKeyXdr = nativeToScVal("balance", { type: "symbol" }).toXDR("base64");

export const liveContractId = StrKey.encodeContract(Buffer.alloc(32, 31));
export const liveRow = {
  xdr: "AAAAAA==",
  lastModifiedLedgerSeq: latestLedger - 100,
  liveUntilLedgerSeq: latestLedger + 5_000
};

export const pendingEvictionContractId = StrKey.encodeContract(Buffer.alloc(32, 33));
export const pendingEvictionRow = {
  xdr: "AAAAAA==",
  lastModifiedLedgerSeq: latestLedger - 500_000,
  liveUntilLedgerSeq: latestLedger - 10
};

export const notFoundContractId = StrKey.encodeContract(Buffer.alloc(32, 34));

export const unavailableContractId = StrKey.encodeContract(Buffer.alloc(32, 35));
export const historyUnavailableContractId = StrKey.encodeContract(Buffer.alloc(32, 36));

export const malformedStorageKeyXdr = "not-valid-base64-xdr";

/** Kept for symmetry with the scaffold's `sample` convention used across other slices. */
export const sample = { contractId: liveContractId, storageKeyXdr, durability: "persistent" };
