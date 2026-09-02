import { StrKey, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { sorobanRpc, isRpcFailure, type JsonRpcFailure } from "@/core/rpc/client";
import type { StellarNetwork } from "@/core/network/types";
import { toContractEventsErrorCode } from "@/features/contract-events/lib/contractEvents.errors";
import type {
  ContractEvent,
  ContractEventsErrorCode,
  ContractEventsInput,
  ContractEventsResult,
  ContractEventType
} from "@/features/contract-events/types";

export const RETENTION_WINDOW = 17280;

interface RawEvent {
  type: string;
  ledger: number;
  ledgerClosedAt?: string;
  contractId?: string;
  id: string;
  pagingToken: string;
  topic: string[];
  value: string;
  inSuccessfulContractCall: boolean;
}

interface GetEventsResult {
  latestLedger: number;
  events: RawEvent[];
}

interface GetLatestLedgerResult {
  sequence: number;
}

export function isKnownEventType(type: string): type is ContractEventType {
  return type === "contract" || type === "system" || type === "diagnostic";
}

export function decodeScVal(base64: string): string {
  try {
    const value = xdr.ScVal.fromXDR(base64, "base64");
    return formatScVal(value);
  } catch {
    return base64;
  }
}

function formatScVal(value: xdr.ScVal): string {
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
      case xdr.ScValType.scvU128().value: {
        const u128 = value.u128();
        return (
          (BigInt.asUintN(64, BigInt(u128.hi().toString())) << 64n) |
          BigInt.asUintN(64, BigInt(u128.lo().toString()))
        ).toString();
      }
      case xdr.ScValType.scvI128().value: {
        const i128 = value.i128();
        const hi = BigInt.asIntN(64, BigInt(i128.hi().toString()));
        const lo = BigInt.asUintN(64, BigInt(i128.lo().toString()));
        return ((hi << 64n) | lo).toString();
      }
      case xdr.ScValType.scvU256().value:
        return formatU256(value.u256());
      case xdr.ScValType.scvI256().value:
        return value.i256().toXDR("base64");
      case xdr.ScValType.scvAddress().value:
        return formatScAddress(value.address());
      case xdr.ScValType.scvVec().value: {
        const vec = value.vec();
        return vec ? `[${vec.map(formatScVal).join(", ")}]` : "[]";
      }
      case xdr.ScValType.scvMap().value: {
        const map = value.map();
        return map
          ? `{${map
              .map((entry) => `${formatScVal(entry.key())}: ${formatScVal(entry.val())}`)
              .join(", ")}}`
          : "{}";
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
  const hiHi = BigInt.asUintN(64, BigInt(value.hiHi().toString()));
  const hiLo = BigInt.asUintN(64, BigInt(value.hiLo().toString()));
  const loHi = BigInt.asUintN(64, BigInt(value.loHi().toString()));
  const loLo = BigInt.asUintN(64, BigInt(value.loLo().toString()));
  return ((hiHi << 192n) | (hiLo << 128n) | (loHi << 64n) | loLo).toString();
}

function normalizeEvent(raw: RawEvent): ContractEvent {
  const type = isKnownEventType(raw.type) ? raw.type : "diagnostic";

  return {
    id: raw.id,
    ledger: raw.ledger,
    closedAt: raw.ledgerClosedAt ?? null,
    type,
    contractId: raw.contractId ?? null,
    topic: raw.topic.map(decodeScVal),
    value: decodeScVal(raw.value),
    successful: raw.inSuccessfulContractCall
  };
}

function isRetentionError(response: JsonRpcFailure): boolean {
  const message = response.error.message.toLowerCase();
  return (
    message.includes("retention") ||
    message.includes("start ledger") ||
    message.includes("ledger range") ||
    message.includes("exceeds")
  );
}

async function fetchLatestLedger(
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<number, ContractEventsErrorCode>> {
  try {
    const response = await sorobanRpc<GetLatestLedgerResult>("getLatestLedger", {}, { network, signal });

    if (isRpcFailure(response)) return err("rpc_error");

    return ok(response.result.sequence);
  } catch (error) {
    if (signal?.aborted) return err("request_failed");
    return err(toContractEventsErrorCode(error));
  }
}

export async function runContractEvents(
  { contractId, startLedger, endLedger }: ContractEventsInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<
  Result<
    ContractEventsResult,
    ContractEventsErrorCode,
    { latestLedger?: number; retentionStart?: number } | undefined
  >
> {
  const params = {
    startLedger,
    endLedger,
    filters: [{ contractIds: [contractId] }]
  };

  try {
    const response = await sorobanRpc<GetEventsResult>("getEvents", params, { network, signal });

    if (isRpcFailure(response)) {
      if (isRetentionError(response)) {
        const latest = await fetchLatestLedger(network, signal);
        if (!latest.ok) return err(latest.code);
        const retentionStart = latest.value - RETENTION_WINDOW + 1;
        return err("range_outside_retention", { latestLedger: latest.value, retentionStart });
      }
      return err("rpc_error");
    }

    const latestLedger = response.result.latestLedger;
    const retentionStart = latestLedger - RETENTION_WINDOW + 1;

    if (startLedger < retentionStart) {
      return err("range_outside_retention", { latestLedger, retentionStart });
    }

    if (!response.result.events.length) {
      return err("no_events");
    }

    const events = response.result.events.map(normalizeEvent);

    return ok({
      contractId,
      startLedger,
      endLedger,
      latestLedger,
      retentionWindow: RETENTION_WINDOW,
      events
    });
  } catch (error) {
    if (signal?.aborted) return err("request_failed");
    return err(toContractEventsErrorCode(error));
  }
}
