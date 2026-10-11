import { StrKey, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { sorobanRpc, isRpcFailure } from "@/core/rpc/client";
import type { StellarNetwork } from "@/core/network/types";
import { toContractStorageErrorCode } from "@/features/contract-storage/lib/contractStorage.errors";
import type {
  ContractStorageErrorCode,
  ContractStorageInput,
  ContractStorageResult,
  StorageEntry
} from "@/features/contract-storage/types";

interface LedgerEntry {
  key: string;
  xdr: string;
  lastModifiedLedgerSeq?: number;
  liveUntilLedgerSeq?: number;
}

interface GetLedgerEntriesResult {
  entries?: LedgerEntry[];
  latestLedger: number;
}

interface GetLatestLedgerResult {
  sequence: number;
}

const MS_PER_LEDGER = 5000;

/**
 * Builds the ledger key for a Soroban contract instance entry.
 *
 * A contract instance is stored as a ContractData ledger entry whose key is
 * the special `LedgerKeyContractInstance` sentinel. This entry contains the
 * contract WASM reference and the instance storage map.
 */
export function buildContractInstanceLedgerKey(contractId: string): string {
  const hash = StrKey.decodeContract(contractId);
  const scAddress = xdr.ScAddress.scAddressTypeContract(hash);
  const contractData = new xdr.LedgerKeyContractData({
    contract: scAddress,
    key: xdr.ScVal.scvLedgerKeyContractInstance(),
    durability: xdr.ContractDataDurability.persistent()
  });

  return xdr.LedgerKey.contractData(contractData).toXDR("base64");
}

function isRpcError(response: unknown): response is { error: { code: number; message: string } } {
  return (
    typeof response === "object" &&
    response !== null &&
    "error" in response &&
    typeof (response as { error?: unknown }).error === "object" &&
    (response as { error: { message?: unknown } }).error.message !== undefined
  );
}

async function fetchLatestLedger(
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<number, ContractStorageErrorCode>> {
  try {
    const response = await sorobanRpc<GetLatestLedgerResult>(
      "getLatestLedger",
      {},
      { network, signal }
    );

    if (isRpcFailure(response)) return err("rpc_error");
    if (isRpcError(response)) return err("rpc_error");

    return ok(response.result.sequence);
  } catch (error) {
    if (signal?.aborted) return err("request_failed");
    return err(toContractStorageErrorCode(error));
  }
}

async function fetchContractInstance(
  contractId: string,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<{ entry: LedgerEntry; latestLedger: number }, ContractStorageErrorCode>> {
  const ledgerKey = buildContractInstanceLedgerKey(contractId);

  try {
    const response = await sorobanRpc<GetLedgerEntriesResult>(
      "getLedgerEntries",
      { keys: [ledgerKey] },
      { network, signal }
    );

    if (isRpcFailure(response)) return err("rpc_error");
    if (isRpcError(response)) return err("rpc_error");

    const entries = response.result.entries ?? [];
    if (!entries.length) return err("contract_not_found");

    return ok({ entry: entries[0], latestLedger: response.result.latestLedger });
  } catch (error) {
    if (signal?.aborted) return err("request_failed");
    return err(toContractStorageErrorCode(error));
  }
}

/**
 * Extracts the instance storage map from a contract instance ledger entry.
 *
 * Instance storage lives inside the contract instance entry, so every entry in
 * the returned map shares the same TTL as the instance itself. Persistent and
 * temporary entries are separate ledger entries and cannot be enumerated from
 * the contract ID alone.
 */
function parseInstanceStorage(entry: LedgerEntry): StorageEntry[] {
  const entries: StorageEntry[] = [];

  try {
    const entryData = xdr.LedgerEntryData.fromXDR(entry.xdr, "base64");
    const contractData = entryData.contractData();
    const value = contractData.val();

    if (value.switch().value !== xdr.ScValType.scvContractInstance().value) {
      return entries;
    }

    const instance = value.instance();
    const storage = instance.storage();
    if (!storage) return entries;

    const liveUntilLedger = entry.liveUntilLedgerSeq ?? null;

    for (const pair of storage) {
      entries.push({
        key: formatScVal(pair.key()),
        value: formatScVal(pair.val()),
        kind: "instance",
        liveUntilLedger,
        ledgersRemaining: null
      });
    }
  } catch {
    // If XDR parsing fails, return whatever we can. The contract was found,
    // so this should not be treated as a not-found error.
  }

  return entries;
}

/**
 * Renders an ScVal as a human-friendly string.
 *
 * Complex or unknown values fall back to their XDR base64 representation so
 * the table stays readable and deterministic.
 */
export function formatScVal(value: xdr.ScVal): string {
  const switchValue = value.switch();

  try {
    switch (switchValue.value) {
      case xdr.ScValType.scvBool().value:
        return value.b() ? "true" : "false";
      case xdr.ScValType.scvSymbol().value:
        return value.sym().toString();
      case xdr.ScValType.scvString().value:
        return value.str().toString();
      case xdr.ScValType.scvBytes().value:
        return Buffer.from(value.bytes()).toString("hex");
      case xdr.ScValType.scvU32().value:
        return String(value.u32());
      case xdr.ScValType.scvI32().value:
        return String(value.i32());
      case xdr.ScValType.scvU64().value:
        return value.u64().toString();
      case xdr.ScValType.scvI64().value:
        return value.i64().toString();
      case xdr.ScValType.scvU128().value:
        return value.u128().lo().toString();
      case xdr.ScValType.scvI128().value:
        return value.i128().lo().toString();
      case xdr.ScValType.scvU256().value:
        return formatU256(value.u256());
      case xdr.ScValType.scvI256().value:
        // The generated TypeScript declarations do not expose the sign bit on
        // Int256Parts, so fall back to a lossless XDR representation.
        return value.i256().toXDR("base64");
      case xdr.ScValType.scvAddress().value:
        return formatScAddress(value.address());
      case xdr.ScValType.scvVec().value: {
        const vec = value.vec();
        return vec ? `[${vec.map(formatScVal).join(", ")}]` : "[]";
      }
      case xdr.ScValType.scvMap().value: {
        const map = value.map();
        return map ? `{${map.map((entry) => `${formatScVal(entry.key())}: ${formatScVal(entry.val())}`).join(", ")}}` : "{}";
      }
      case xdr.ScValType.scvLedgerKeyContractInstance().value:
        return "LedgerKeyContractInstance";
      case xdr.ScValType.scvContractInstance().value:
        return "ContractInstance";
      default:
        return value.toXDR("base64");
    }
  } catch {
    return value.toXDR("base64");
  }
}

function formatScAddress(address: xdr.ScAddress): string {
  const type = address.switch();

  try {
    if (type.value === xdr.ScAddressType.scAddressTypeAccount().value) {
      return StrKey.encodeEd25519PublicKey(address.accountId().ed25519());
    }

    if (type.value === xdr.ScAddressType.scAddressTypeContract().value) {
      return StrKey.encodeContract(address.contractId());
    }
  } catch {
    // fall through to XDR
  }

  return address.toXDR("base64");
}

function formatU256(value: xdr.UInt256Parts): string {
  // Construct a BigInt from the four 64-bit parts, highest first.
  const hiHi = BigInt.asUintN(64, BigInt(value.hiHi().toString()));
  const hiLo = BigInt.asUintN(64, BigInt(value.hiLo().toString()));
  const loHi = BigInt.asUintN(64, BigInt(value.loHi().toString()));
  const loLo = BigInt.asUintN(64, BigInt(value.loLo().toString()));
  return ((hiHi << 192n) | (hiLo << 128n) | (loHi << 64n) | loLo).toString();
}

/**
 * Core tool logic. Reads a Soroban contract instance from the selected
 * network's RPC node and returns its instance storage entries with TTLs.
 *
 * Never throws for expected failures — returns a Result.
 */
export async function runContractStorage(
  { contractId }: ContractStorageInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<ContractStorageResult, ContractStorageErrorCode>> {
  const [instanceResult, latestResult] = await Promise.all([
    fetchContractInstance(contractId, network, signal),
    fetchLatestLedger(network, signal)
  ]);

  if (!instanceResult.ok) return instanceResult;
  if (!latestResult.ok) return latestResult;

  const { entry } = instanceResult.value;
  const latestLedgerSequence = latestResult.value;

  const entries = parseInstanceStorage(entry).map((storageEntry) => ({
    ...storageEntry,
    ledgersRemaining:
      storageEntry.liveUntilLedger === null
        ? null
        : storageEntry.liveUntilLedger - latestLedgerSequence
  }));

  return ok({
    contractId,
    latestLedger: latestLedgerSequence,
    ledgerCloseTimeMs: MS_PER_LEDGER,
    entries
  });
}
