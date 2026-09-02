import { StrKey } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { normalizeInput } from "@/core/lib/strings";
import type {
  ContractEventsErrorCode,
  ContractEventsInput
} from "@/features/contract-events/types";

export interface RawContractEventsInput {
  contractId: string;
  startLedger: string;
  endLedger: string;
}

/**
 * Parses raw form input into a validated request.
 *
 * Ledger numbers are validated as non-negative integers and the start ledger
 * must not be greater than the end ledger.
 */
export function parseContractEventsInput(
  raw: RawContractEventsInput
): Result<ContractEventsInput, ContractEventsErrorCode> {
  const contractId = normalizeInput(raw.contractId);
  if (!contractId) return err("empty_contract_id");
  if (!StrKey.isValidContract(contractId)) return err("invalid_contract_id");

  const startLedger = parseLedger(raw.startLedger);
  const endLedger = parseLedger(raw.endLedger);

  if (startLedger === null || endLedger === null) return err("invalid_ledger_range");
  if (startLedger < 0 || endLedger < 0) return err("invalid_ledger_range");
  if (startLedger > endLedger) return err("invalid_ledger_range");

  return ok({ contractId, startLedger, endLedger });
}

function parseLedger(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const num = Number(trimmed);
  if (!Number.isFinite(num)) return null;
  if (!Number.isInteger(num)) return null;

  return num;
}
