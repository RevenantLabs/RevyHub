import { StrKey, xdr } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { instanceEntry } from "./wasm-contract.fixture";

export const builtinContractId = StrKey.encodeContract(Buffer.alloc(32, 23));
export const builtinInstanceXdr = instanceEntry(builtinContractId, xdr.ContractExecutable.contractExecutableStellarAsset(), 11);
