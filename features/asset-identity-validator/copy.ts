import type { AssetIdentityErrorCode } from "@/features/asset-identity-validator/types";

export const copy = {
  formAriaLabel: "Asset code and issuer",
  codeLabel: "Asset code",
  codeHint: "1–4 characters is alphanumeric 4. 5–12 is alphanumeric 12. Use only A–Z and 0–9.",
  codePlaceholder: "USDC",
  issuerLabel: "Issuer",
  issuerHint:
    "Public address starting with G. A value starting with S is a secret seed: it is discarded and never shown.",
  issuerPlaceholder: "G...",
  submit: "Validate asset",
  loading: "Checking the asset identity",
  emptyTitle: "No asset checked yet",
  emptyDescription:
    "Enter a classic asset code and the issuing account's public address. The check stays in this browser and does not ask whether the asset exists.",
  resultTitle: "Canonical identity",
  successTitle: "This asset identity is valid",
  successDescription:
    "The canonical string is the code and the issuer joined together. No network was queried.",
  tierAlphanum4: "Alphanumeric 4",
  tierAlphanum12: "Alphanumeric 12",
  lengthSingular: "character",
  lengthPlural: "characters",
  canonicalLabel: "Canonical asset",
  issuerResultLabel: "Issuer"
} as const;

export const errorCopy: Record<AssetIdentityErrorCode, { title: string; description: string }> = {
  empty_code: {
    title: "Enter an asset code",
    description: "Type a code of 1 to 12 characters, then validate again."
  },
  invalid_code_length: {
    title: "That code length is not a Stellar tier",
    description:
      "Use 1–4 characters for alphanumeric 4, or 5–12 characters for alphanumeric 12. Shorten or extend the code to one of those lengths."
  },
  invalid_code_characters: {
    title: "That code uses characters Stellar does not allow",
    description:
      "Keep only uppercase A–Z and digits 0–9. Remove spaces, symbols and lowercase letters, then validate again."
  },
  invalid_issuer: {
    title: "That issuer is not a public address",
    description:
      "Paste the issuing account's public address. It starts with G. If you pasted a secret seed starting with S, it was discarded and is not shown — do not paste it again."
  },
  reserved_native_conflict: {
    title: "XLM cannot take a custom issuer",
    description:
      "XLM is the reserved native code. Remove the issuer to stop treating it as a credit asset, or replace XLM with your issued asset code."
  }
};
