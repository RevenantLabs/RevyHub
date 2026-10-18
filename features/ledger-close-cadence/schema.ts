import { err, ok, type Result } from "@/core/result/result";
import {
  SAMPLE_SIZE_MAX,
  SAMPLE_SIZE_MIN,
  type LedgerCloseCadenceErrorCode,
  type LedgerCloseCadenceInput,
  type RawLedgerCloseCadenceForm
} from "@/features/ledger-close-cadence/types";

/**
 * Validates sample size without talking to Horizon.
 * Accepts whole numbers from SAMPLE_SIZE_MIN to SAMPLE_SIZE_MAX inclusive.
 */
export function parseLedgerCloseCadenceInput(
  raw: RawLedgerCloseCadenceForm
): Result<LedgerCloseCadenceInput, LedgerCloseCadenceErrorCode> {
  const trimmed = raw.sampleSize.trim();

  if (!trimmed || !/^\d+$/.test(trimmed)) {
    return err("invalid_sample_size");
  }

  const sampleSize = Number(trimmed);

  if (
    !Number.isSafeInteger(sampleSize) ||
    sampleSize < SAMPLE_SIZE_MIN ||
    sampleSize > SAMPLE_SIZE_MAX
  ) {
    return err("invalid_sample_size");
  }

  return ok({ sampleSize });
}
