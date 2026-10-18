import { Address, hash, StrKey, xdr } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";

export const wasmBytes = Buffer.from("revyhub-wasm-v1");
export const wasmDigest = hash(wasmBytes);
export const contractId = StrKey.encodeContract(Buffer.alloc(32, 21));
const voidExtensionXdr = Buffer.alloc(4);

export function instanceEntry(id: string, executable: xdr.ContractExecutable, lastModified = 10): string {
  return new xdr.LedgerEntry({
    lastModifiedLedgerSeq: lastModified,
    data: xdr.LedgerEntryData.contractData(new xdr.ContractDataEntry({
      ext: xdr.ExtensionPoint.fromXDR(voidExtensionXdr),
      contract: new Address(id).toScAddress(),
      key: xdr.ScVal.scvLedgerKeyContractInstance(),
      durability: xdr.ContractDataDurability.persistent(),
      val: xdr.ScVal.scvContractInstance(new xdr.ScContractInstance({ executable, storage: null }))
    })),
    ext: xdr.LedgerEntryExt.fromXDR(voidExtensionXdr)
  }).toXDR("base64");
}

export function codeEntry(digest: Buffer, code: Buffer, lastModified = 20): string {
  return new xdr.LedgerEntry({
    lastModifiedLedgerSeq: lastModified,
    data: xdr.LedgerEntryData.contractCode(new xdr.ContractCodeEntry({
      ext: xdr.ContractCodeEntryExt.fromXDR(voidExtensionXdr),
      hash: digest,
      code
    })),
    ext: xdr.LedgerEntryExt.fromXDR(voidExtensionXdr)
  }).toXDR("base64");
}

export const instanceXdr = instanceEntry(contractId, xdr.ContractExecutable.contractExecutableWasm(wasmDigest));
export const codeXdr = codeEntry(wasmDigest, wasmBytes);
export const mismatchBytes = Buffer.from("revyhub-wasm-other");
export const mismatchDigest = hash(mismatchBytes);
export const mismatchContractId = StrKey.encodeContract(Buffer.alloc(32, 22));
export const mismatchInstanceXdr = instanceEntry(mismatchContractId, xdr.ContractExecutable.contractExecutableWasm(mismatchDigest));
export const mismatchCodeXdr = codeEntry(mismatchDigest, wasmBytes);
export const archivedContractId = StrKey.encodeContract(Buffer.alloc(32, 24));
export const malformedContractId = StrKey.encodeContract(Buffer.alloc(32, 25));
export const missingContractId = StrKey.encodeContract(Buffer.alloc(32, 26));
export const unavailableContractId = StrKey.encodeContract(Buffer.alloc(32, 27));
