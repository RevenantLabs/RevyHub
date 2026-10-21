import { Address, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { isRpcFailure, sorobanRpc } from "@/core/rpc/client";
import type { StellarNetwork } from "@/core/network/types";
import type { Durability, ErrorCode, LedgerResult } from "../types";
import { mapRpcFailure, mapTransport } from "./sorobanRestoreReadiness.errors";

/** Builds the base64 `LedgerKey` XDR for a `contract_data` entry at the given durability. */
export function contractDataLedgerKey(contractId: string, storageKeyXdr: string, durability: Durability): string {
  const key = xdr.ScVal.fromXDR(storageKeyXdr, "base64");
  return xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: new Address(contractId).toScAddress(),
      key,
      durability:
        durability === "temporary"
          ? xdr.ContractDataDurability.temporary()
          : xdr.ContractDataDurability.persistent()
    })
  ).toXDR("base64");
}

/** Reads the single ledger entry for the given key via Soroban RPC `getLedgerEntries`. */
export async function fetchEntryState(
  contractId: string,
  storageKeyXdr: string,
  durability: Durability,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<LedgerResult, ErrorCode>> {
  let key: string;
  try {
    key = contractDataLedgerKey(contractId, storageKeyXdr, durability);
  } catch {
    return err("invalid_storage_key");
  }

  try {
    const response = await sorobanRpc<LedgerResult>("getLedgerEntries", { keys: [key] }, { network, signal });
    if (isRpcFailure(response)) return mapRpcFailure(response.error);
    return ok(response.result);
  } catch (error) {
    return err(mapTransport(error));
  }
}
