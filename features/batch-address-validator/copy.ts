import type { BatchAddressValidatorErrorCode } from "@/features/batch-address-validator/types";
import { MAX_LINES } from "@/features/batch-address-validator/schema";

export const copy = {
  formLabel: "Stellar addresses",
  formHint: `Paste one address per line, or separate with commas or spaces. Up to ${MAX_LINES} addresses. Never paste secret keys that start with S.`,
  submit: "Validate list",
  emptyTitle: "No list checked yet",
  emptyDescription:
    "Paste a payout or airdrop address list above. Every check runs in your browser — nothing leaves this page.",
  resultTitle: "Validation results",
  summaryTitle: "Summary",
  linesTitle: "Per-line results",
  columnLine: "Line",
  columnAddress: "Address",
  columnStatus: "Status",
  columnReason: "Reason",
  lineValid: "Valid Stellar public address",
  lineEmpty: "Empty row",
  summaryValid: (count: number) => `${count} valid`,
  summaryInvalid: (count: number) => `${count} invalid`,
  summaryDuplicated: (count: number) => `${count} duplicated`,
  summarySecretSeeds: (count: number) => `${count} secret ${count === 1 ? "key" : "keys"} rejected`,
  duplicateLines: (lines: number[]) => `Also on line${lines.length === 1 ? "" : "s"} ${lines.join(", ")}`,
  secretSeedRow: "Secret key — not shown",
  allValidTitle: "Every address in the list is valid"
} as const;

export const errorCopy: Record<BatchAddressValidatorErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Paste a list first",
    description: "Add one or more Stellar addresses above before validating."
  },
  no_valid_lines: {
    title: "No addresses found in that input",
    description:
      "The text did not contain any address-like tokens after splitting on newlines, commas and spaces."
  },
  too_many_lines: {
    title: `Too many addresses (limit is ${MAX_LINES})`,
    description: `Split the list into batches of ${MAX_LINES} or fewer and validate each batch separately.`
  }
};
