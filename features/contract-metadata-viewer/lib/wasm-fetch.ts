import { Address, xdr } from "@stellar/stellar-sdk"; import { err, ok, type Result } from "@/core/result/result"; import { isRpcFailure, sorobanRpc } from "@/core/rpc/client"; import type { StellarNetwork } from "@/core/network/types"; import type { ContractMetadataViewerErrorCode } from "@/features/contract-metadata-viewer/types";
export const MAX_WASM_BYTES = 1_048_576;
interface LedgerResult { entries?: Array<{ xdr?: string }> }
function instanceKey(contractId: string): string { return xdr.LedgerKey.contractData(new xdr.LedgerKeyContractData({ contract: new Address(contractId).toScAddress(), key: xdr.ScVal.scvLedgerKeyContractInstance(), durability: xdr.ContractDataDurability.persistent() })).toXDR("base64"); }
function codeKey(hash: Buffer): string { return xdr.LedgerKey.contractCode(new xdr.LedgerKeyContractCode({ hash })).toXDR("base64"); }
async function read(key: string, network: StellarNetwork, signal?: AbortSignal): Promise<Result<string, ContractMetadataViewerErrorCode>> {
  try { const response = await sorobanRpc<LedgerResult>("getLedgerEntries", { keys: [key] }, { network, signal }); if (isRpcFailure(response)) return err(response.error.code === -32602 ? "contract_not_found" : "request_failed"); const encoded = response.result.entries?.[0]?.xdr; return encoded ? ok(encoded) : err("contract_not_found"); }
  catch (error) { return err((error as { status?: number }).status === 429 ? "rate_limited" : "request_failed"); }
}
export async function fetchContractWasm(contractId: string, network: StellarNetwork, signal?: AbortSignal): Promise<Result<Uint8Array, ContractMetadataViewerErrorCode>> {
  const instance = await read(instanceKey(contractId), network, signal); if (!instance.ok) return instance;
  try {
    const executable = xdr.LedgerEntry.fromXDR(instance.value, "base64").data().contractData().val().instance().executable();
    if (executable.switch().name !== "contractExecutableWasm") return err("contract_not_found");
    const code = await read(codeKey(Buffer.from(executable.wasmHash())), network, signal); if (!code.ok) return code;
    const wasm = new Uint8Array(xdr.LedgerEntry.fromXDR(code.value, "base64").data().contractCode().code());
    if (wasm.length > MAX_WASM_BYTES) return err("too_large"); return ok(wasm);
  } catch { return err("request_failed"); }
}
