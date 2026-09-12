import type {
  StrKeyKind,
  StrkeyInspectorErrorCode
} from "@/features/strkey-inspector/types";

export const copy = {
  formLabel: "Stellar StrKey",
  formHint:
    "Paste a public StrKey (starting with G, M, C, T, X, or P). Secret seeds (starting with S) are strictly rejected.",
  submit: "Inspect StrKey",
  pendingSubmit: "Inspecting...",
  emptyTitle: "No StrKey inspected yet",
  emptyDescription:
    "Paste any Stellar StrKey above to inspect its kind, decode its raw binary payload to hex, and check muxed account parameters.",
  resultTitle: "StrKey Inspection Result",
  fieldKind: "StrKey Kind",
  fieldPrefix: "Prefix",
  fieldStrkey: "Encoded StrKey",
  fieldHex: "Raw Decoded Bytes (Hex)",
  fieldByteLength: "Byte Length",
  fieldMuxedGAddress: "Underlying G Account",
  fieldMuxedId: "Multiplexing ID"
} as const;

export const kindLabels: Record<StrKeyKind, string> = {
  ed25519_public_key: "Ed25519 Public Key (Account ID)",
  muxed_account: "Muxed Account (Med25519)",
  contract: "Soroban Contract ID",
  pre_auth_tx: "Pre-Authorized Transaction Hash",
  sha256_hash: "SHA-256 Hash Signer",
  signed_payload: "Signed Payload Signer"
};

export const errorCopy: Record<
  StrkeyInspectorErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Enter a StrKey first",
    description:
      "Paste a Stellar StrKey into the field above to inspect its encoding."
  },
  secret_seed_rejected: {
    title: "Secret key rejected",
    description:
      "Values starting with S are private seeds. This tool discarded the input immediately without decoding or displaying it. Never share secret keys."
  },
  unknown_prefix: {
    title: "Unrecognised StrKey prefix",
    description:
      "The first character is not a recognized Stellar public version byte (G, M, C, T, X, P). Check for missing characters or an unsupported prefix."
  },
  bad_checksum: {
    title: "Invalid checksum or length",
    description:
      "The prefix is recognised, but the value failed base32 decoding or checksum verification. Check for typos or truncated characters."
  },
  request_failed: {
    title: "Inspection failed",
    description:
      "An unexpected error occurred while inspecting the StrKey. Verify the input string and try again."
  }
};
