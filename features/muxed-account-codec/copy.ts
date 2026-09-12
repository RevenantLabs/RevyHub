import type { MuxedAccountCodecErrorCode } from "@/features/muxed-account-codec/types";

export const copy = {
  title: "Muxed Account Encoder and Decoder",
  formHeading: "Muxed Account Conversion",
  modeLabel: "Operation mode",
  modeDecode: "Decode M-Address",
  modeEncode: "Encode G-Address + ID",
  decodeAddressLabel: "Multiplexed address (M-address)",
  decodeAddressHint: "Paste an M... address to extract its base G... account and 64-bit routing ID.",
  decodeAddressPlaceholder: "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAAGZFQ",
  baseAddressLabel: "Base account address (G-address)",
  baseAddressHint: "Enter the base Stellar public key (starts with G). Never enter a secret key (starts with S).",
  baseAddressPlaceholder: "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
  idLabel: "Multiplexing ID (uint64)",
  idHint: "Enter an unsigned 64-bit integer (0 to 18,446,744,073,709,551,615).",
  idPlaceholder: "123456789012345678",
  submitDecode: "Decode address",
  submitEncode: "Encode address",
  emptyTitle: "No conversion performed yet",
  emptyDescription:
    "Select Decode to unpack an M-address into its base account and multiplexing ID, or Encode to combine a G-address with an ID. All conversion runs offline in your browser.",
  resultTitle: "Conversion Result",
  resultSummaryDecode: "Successfully decoded M-address into base account and multiplexing ID.",
  resultSummaryEncode: "Successfully encoded base account and multiplexing ID into M-address.",
  resultMuxedAddress: "Multiplexed Address (M...)",
  resultBaseAddress: "Base Account (G...)",
  resultIdDecimal: "Multiplexing ID (Decimal)",
  resultIdFormatted: "Multiplexing ID (Grouped)",
  resultIdHex: "Multiplexing ID (Hex 64-bit)",
  explanationTitle: "Account & Routing Relationship",
  explanationText:
    "An M-address (multiplexed address) and its underlying G-address represent the same ledger account with different routing. Funds sent to an M-address reside under the base G-address on the Stellar ledger. The embedded 64-bit multiplexing ID routes payments to a specific sub-account or user off-chain without requiring a transaction memo.",
  reset: "Clear and reset",
  loadingMessage: "Processing conversion..."
} as const;

export const errorCopy: Record<
  MuxedAccountCodecErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Enter an address or ID first",
    description:
      "Provide an M-address to decode, or a base G-address and 64-bit multiplexing ID to encode."
  },
  invalid_muxed_address: {
    title: "Invalid multiplexed address",
    description:
      "Enter a valid Stellar M-address. It must start with M, use valid base32 characters, and satisfy the SEP-0023 StrKey checksum. Never paste a secret seed (starting with S)."
  },
  invalid_base_address: {
    title: "Invalid base account address",
    description:
      "Enter a valid Stellar public key starting with G that satisfies the StrKey checksum. Never paste a secret key starting with S."
  },
  invalid_id: {
    title: "Invalid multiplexing ID",
    description:
      "Enter an unsigned 64-bit integer between 0 and 18446744073709551615 (inclusive). Do not use negative numbers, decimals, or non-numeric characters."
  }
};
