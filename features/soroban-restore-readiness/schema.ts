import { StrKey, xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { Durability, ErrorCode, ParsedInput, RawInput } from "./types";

const SECRET_PREFIX = /^S/;

function isContractId(value: string): boolean {
  return !SECRET_PREFIX.test(value) && StrKey.isValidContract(value);
}

function isDurability(value: string): value is Durability {
  return value === "persistent" || value === "temporary";
}

/** Parses raw form input into a validated request, without making a request. */
export function parseInput(raw: RawInput): Result<ParsedInput, ErrorCode> {
  const contractId = (raw.contractId ?? "").trim();
  if (!isContractId(contractId)) return err("invalid_contract_id");

  const storageKeyXdr = (raw.storageKeyXdr ?? "").trim();
  if (!storageKeyXdr) return err("invalid_storage_key");
  try {
    xdr.ScVal.fromXDR(storageKeyXdr, "base64");
  } catch {
    return err("invalid_storage_key");
  }

  const durability = (raw.durability || "persistent").trim();
  if (!isDurability(durability)) return err("invalid_storage_key");

  return ok({ contractId, storageKeyXdr, durability });
}
