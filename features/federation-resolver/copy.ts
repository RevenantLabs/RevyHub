import type { FederationErrorCode } from "@/features/federation-resolver/types";

export const copy = {
  formLabel: "Federation address",
  formHint: "In the form name*domain, for example alice*stellar.org.",
  submit: "Resolve address",
  loading: "Resolving...",
  emptyTitle: "No address resolved yet",
  emptyDescription:
    "Enter a federated address to find the Stellar account it points at, along with any memo the receiver requires.",
  resultTitle: "Resolved account",
  provenanceTitle: "How this was resolved",
  memoWarningTitle: "This address requires a memo",
  memoWarningDescription:
    "The federation server returned a memo. It identifies the recipient at a shared account — a payment sent without it is very likely to be lost.",
  noMemoTitle: "No memo required",
  noMemoDescription: "The federation server did not return a memo for this address.",
  labelAccount: "Account",
  labelMemo: "Memo",
  labelMemoType: "Memo type",
  labelAddress: "Federation address",
  labelServer: "Federation server",
  labelToml: "stellar.toml"
} as const;

export const errorCopy: Record<FederationErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Enter a federation address",
    description: "Federated addresses look like alice*stellar.org."
  },
  invalid_syntax: {
    title: "That is not a federation address",
    description:
      "The format is name*domain: a name of up to 64 letters, digits, dots, underscores or hyphens, an asterisk, then a valid hostname."
  },
  toml_not_found: {
    title: "That domain publishes no stellar.toml",
    description:
      "Federation requires a file at /.well-known/stellar.toml. The domain may not support federation, or may be blocking browser requests."
  },
  toml_malformed: {
    title: "The domain's stellar.toml is malformed",
    description: "Its FEDERATION_SERVER value is not a valid URL."
  },
  no_federation_server: {
    title: "That domain does not declare a federation server",
    description:
      "The stellar.toml was found but contains no FEDERATION_SERVER entry, so there is nowhere to send the lookup."
  },
  https_required: {
    title: "The federation server is not HTTPS",
    description:
      "This tool refuses plaintext federation servers. Sending a name over HTTP would expose who is being paid."
  },
  name_not_found: {
    title: "That name does not exist on that domain",
    description: "The federation server answered, but it has no record for this name."
  },
  federation_malformed: {
    title: "The federation server returned an unusable response",
    description:
      "The reply was not valid JSON, or it was missing the account_id field the protocol requires."
  },
  federation_server_error: {
    title: "The federation server returned an error",
    description: "The server is reachable but failed to answer. Try again in a moment."
  },
  invalid_account_id: {
    title: "The federation server returned an invalid account",
    description:
      "The account_id it gave back is not a valid Stellar public key. Do not send funds to it."
  },
  invalid_memo: {
    title: "The federation server returned an invalid memo",
    description:
      "The memo is missing its type, uses an unsupported type, or exceeds the 28-byte limit for text memos. Sending a payment with a bad memo risks losing it."
  },
  timeout: {
    title: "The lookup timed out",
    description: "Neither the domain nor its federation server answered in time."
  },
  network_error: {
    title: "Could not reach the domain",
    description:
      "The request never completed. The server may be offline, or it may not send the CORS headers a browser needs."
  }
};
