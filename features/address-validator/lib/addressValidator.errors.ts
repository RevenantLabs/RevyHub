import type { AddressValidationCode } from "@/features/address-validator/types";

/** Codes that mean "the user must change the input before anything can work". */
const BLOCKING: readonly AddressValidationCode[] = [
  "empty_input",
  "secret_seed_rejected",
  "unknown_prefix",
  "bad_checksum_or_length"
];

export function isBlocking(code: AddressValidationCode): boolean {
  return BLOCKING.includes(code);
}

/** Codes that must never cause the submitted value to be rendered back. */
export function shouldRedact(code: AddressValidationCode): boolean {
  return code === "secret_seed_rejected";
}
