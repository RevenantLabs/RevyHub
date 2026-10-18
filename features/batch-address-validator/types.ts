import type { AddressValidationCode } from "@/features/address-validator/types";

export interface BatchAddressValidatorInput {
  lines: string[];
}

export interface BatchLineResult {
  line: number;
  /** The address after whitespace stripping, or empty when it must not be echoed. */
  address: string;
  valid: boolean;
  code: AddressValidationCode;
  /** Every line number where this same address appears, when duplicated. */
  duplicateLines?: number[];
}

export interface BatchAddressValidatorSummary {
  total: number;
  valid: number;
  invalid: number;
  duplicated: number;
  secretSeeds: number;
}

export interface BatchAddressValidatorResult {
  lines: BatchLineResult[];
  summary: BatchAddressValidatorSummary;
}

export type BatchAddressValidatorErrorCode = "empty_input" | "no_valid_lines" | "too_many_lines";
