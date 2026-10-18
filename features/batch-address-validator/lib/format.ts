import { errorCopy as addressErrorCopy } from "@/features/address-validator/copy";
import type { AddressValidationCode } from "@/features/address-validator/types";
import { copy } from "@/features/batch-address-validator/copy";
import type { BatchAddressValidatorSummary } from "@/features/batch-address-validator/types";

export function formatSummary(summary: BatchAddressValidatorSummary): string {
  const parts = [
    copy.summaryValid(summary.valid),
    copy.summaryInvalid(summary.invalid),
    copy.summaryDuplicated(summary.duplicated)
  ];

  if (summary.secretSeeds > 0) {
    parts.push(copy.summarySecretSeeds(summary.secretSeeds));
  }

  return parts.join(" · ");
}

export function formatLineReason(code: AddressValidationCode): string {
  if (code === "valid") return copy.lineValid;
  if (code === "empty_input") return copy.lineEmpty;

  return addressErrorCopy[code].title;
}

export function formatDuplicateLines(lines: number[]): string {
  return copy.duplicateLines(lines);
}
