import { nativeToScVal, StrKey } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";

export const expiredTemporaryContractId = StrKey.encodeContract(Buffer.alloc(32, 37));
export const expiredTemporaryStorageKeyXdr = nativeToScVal("session", { type: "symbol" }).toXDR("base64");

/**
 * Temporary entries are deleted outright once expired — there is no
 * archive-layer row left, so the RPC fixture returns an empty `entries`
 * array for this key, the same shape as a key that never existed. The tool
 * tells the two cases apart using the durability the caller declared, not a
 * signal from the response.
 */
export const latestLedgerAtExpiry = 1_000_000;
