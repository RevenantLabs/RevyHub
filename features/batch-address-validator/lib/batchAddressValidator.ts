import { validateAddress } from "@/features/address-validator/lib/addressValidator";
import { shouldRedact } from "@/features/address-validator/lib/addressValidator.errors";
import type {
  BatchAddressValidatorInput,
  BatchAddressValidatorResult,
  BatchAddressValidatorSummary,
  BatchLineResult
} from "@/features/batch-address-validator/types";

/** Validates every address in a parsed list and builds per-line results plus a summary. */
export function runBatchAddressValidator(
  input: BatchAddressValidatorInput
): BatchAddressValidatorResult {
  const normalized = input.lines.map((raw) => raw.replace(/\s+/g, ""));

  const occurrences = new Map<string, number[]>();
  normalized.forEach((address, index) => {
    if (!address) return;
    const lines = occurrences.get(address) ?? [];
    lines.push(index + 1);
    occurrences.set(address, lines);
  });

  const lines: BatchLineResult[] = input.lines.map((_, index) => {
    const line = index + 1;
    const address = normalized[index];
    const validation = validateAddress({ address });
    const duplicateLines = occurrences.get(address);

    return {
      line,
      address: shouldRedact(validation.code) ? "" : validation.address,
      valid: validation.valid,
      code: validation.code,
      duplicateLines: duplicateLines && duplicateLines.length > 1 ? duplicateLines : undefined
    };
  });

  const summary: BatchAddressValidatorSummary = {
    total: lines.length,
    valid: lines.filter((entry) => entry.valid).length,
    invalid: lines.filter((entry) => !entry.valid).length,
    duplicated: lines.filter((entry) => entry.duplicateLines).length,
    secretSeeds: lines.filter((entry) => entry.code === "secret_seed_rejected").length
  };

  return { lines, summary };
}
