import { Address, StrKey, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";

export type InstanceKind = { kind: "wasm"; hash: Buffer } | { kind: "builtin" };

export function instanceLedgerKey(contractId: string): string {
  return xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: new Address(contractId).toScAddress(),
      key: xdr.ScVal.scvLedgerKeyContractInstance(),
      durability: xdr.ContractDataDurability.persistent()
    })
  ).toXDR("base64");
}

export function isContractId(value: string): boolean {
  return !value.startsWith("S") && StrKey.isValidContract(value);
}

/** Classify a contract-instance ledger entry. Built-in asset contracts have no Wasm hash. */
export function decodeInstance(encoded: string): Result<InstanceKind, "malformed_entry"> {
  try {
    const executable = xdr.LedgerEntry.fromXDR(encoded, "base64").data().contractData().val().instance().executable();
    if (executable.switch().name === "contractExecutableWasm") return ok({ kind: "wasm", hash: Buffer.from(executable.wasmHash()) });
    if (executable.switch().name === "contractExecutableStellarAsset") return ok({ kind: "builtin" });
    return err("malformed_entry");
  } catch {
    return err("malformed_entry");
  }
}
