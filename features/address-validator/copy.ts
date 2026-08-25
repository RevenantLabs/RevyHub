import type { AddressErrorCode } from "@/features/address-validator/types";

export const copy = {
  formLabel: "Stellar address",
  formHint:
    "Paste a public address. It starts with G and is safe to share. Never paste a secret key that starts with S.",
  submit: "Validate address",
  emptyTitle: "No address checked yet",
  emptyDescription:
    "Paste a Stellar address above. Everything happens in your browser — no request leaves this page.",
  resultTitle: "Validation result",
  validTitle: "This is a valid Stellar public address"
} as const;

export const errorCopy: Record<AddressErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Enter an address first",
    description: "Paste a Stellar address into the field above to check it."
  },
  secret_seed_rejected: {
    title: "That looks like a secret key",
    description:
      "Values starting with S are secret seeds. This tool discarded it without checking or displaying it. Treat that key as compromised if you pasted it anywhere else, and never share it."
  },
  unknown_prefix: {
    title: "This does not look like a Stellar address",
    description:
      "Stellar addresses begin with G (account), M (muxed account) or C (contract). Check for a missing first character or an extra copied prefix."
  },
  bad_checksum_or_length: {
    title: "The checksum or length is wrong",
    description:
      "The prefix is valid but the value fails Stellar's base32 checksum. This is usually a truncated paste or a single mistyped character."
  },
  unsupported_kind: {
    title: "Valid, but not an account address",
    description:
      "This is a well-formed Stellar identifier of a different kind. This tool validates Ed25519 account addresses that start with G."
  }
};
