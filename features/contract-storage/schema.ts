import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type {
  ContractStorageErrorCode,
  ContractStorageInput
} from "@/features/contract-storage/types";

/**
 * Parses raw form input into a validated contract ID.
 *
 * Soroban contract IDs are StrKey-encoded 32-byte hashes that begin with C.
 * The decode step also validates the checksum.
 */
export function parseContractStorageInput(
  raw: string
): Result<ContractStorageInput, ContractStorageErrorCode> {
  const contractId = normalizeInput(raw);

  if (!contractId) return err("empty_contract_id");
  if (!StrKey.isValidContract(contractId)) return err("invalid_contract_id");

  return ok({ contractId });
}
