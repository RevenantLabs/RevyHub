import type { TomlValidatorErrorCode } from "@/features/toml-validator/types";

export const copy = {
  formLabel: "Domain or stellar.toml",
  formHint: "Paste TOML for an offline check, or enter an HTTPS domain to fetch /.well-known/stellar.toml.",
  submit: "Validate TOML",
  emptyTitle: "No stellar.toml validated",
  emptyDescription: "Check SEP-1 fields, currency issuer checksums, warnings and fetched CORS metadata.",
  resultTitle: "stellar.toml validation"
} as const;

export const errorCopy: Record<TomlValidatorErrorCode, { title: string; description: string }> = {
  empty_input: { title: "Enter a domain or TOML document", description: "Paste stellar.toml text or provide the HTTPS domain that publishes it." },
  invalid_domain: { title: "That domain is not valid", description: "Use an HTTPS hostname without credentials or a local address." },
  toml_unreachable: { title: "stellar.toml could not be fetched", description: "Check the domain and its /.well-known/stellar.toml endpoint." },
  toml_invalid: { title: "The TOML document is invalid", description: "Fix the TOML syntax and make sure currency fields use valid values." },
  request_failed: { title: "Validation did not complete", description: "Check the input and try again." }
};
