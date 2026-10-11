import type { AssetDescriptorCodecErrorCode } from "@/features/asset-descriptor-codec/types";

/** Static user-facing copy for the asset descriptor and XDR codec slice. */
export const copy = {
  modeLabel: "Operation mode",
  modeEncode: "Encode descriptor",
  modeDecode: "Decode XDR",
  inputLabel: "Asset representation",
  inputHintEncode:
    "Enter 'native' or an issued asset descriptor in 'CODE:ISSUER' format (e.g. USDC:GA...).",
  inputHintDecode:
    "Paste a base64-encoded Stellar Asset XDR string (e.g. AAAAAA== for native).",
  inputPlaceholderEncode: "native or USDC:GA5Z6437E55QS7HXAHQGNFMAWDTWGNARLXMD3MWZ2ZRO2224AHOETZND",
  inputPlaceholderDecode: "AAAAAVVTREMAAAAAQj59BfLsr7/sGSshWj8b6WrtuNjnAlSr40E+AgfeVrI=",
  submitEncode: "Encode asset",
  submitDecode: "Decode XDR",
  emptyTitle: "No asset converted yet",
  emptyDescription:
    "Choose an operation mode above, provide an asset descriptor or base64 Asset XDR, and run the codec to inspect canonical outputs.",
  resultTitle: "Codec result",
  resultSummary: "Canonical asset identity and encodings",
  labelMode: "Mode",
  labelType: "Asset type",
  labelCode: "Asset code",
  labelIssuer: "Asset issuer",
  labelCanonical: "Canonical descriptor",
  labelXdr: "Asset XDR (base64)",
  labelJson: "Structured JSON",
  noIssuerNative: "None (native asset)",
  copyButton: "Copy",
  resetButton: "Reset workbench"
} as const;

/** Error copy explaining what failed and actionable instructions on what to do next. */
export const errorCopy: Record<
  AssetDescriptorCodecErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Required input missing",
    description:
      "Please enter an asset descriptor (such as 'native' or 'CODE:ISSUER') or paste a base64 Asset XDR payload."
  },
  invalid_input: {
    title: "Invalid input format",
    description:
      "Check your input format. Descriptors must be 'native' or 'CODE:ISSUER' with 1-12 alphanumeric characters. XDR inputs must be valid unpadded base64 with no trailing bytes. Secret keys are strictly prohibited."
  },
  input_too_large: {
    title: "Input exceeds maximum length",
    description:
      "The input text exceeds the maximum supported length of 4,096 characters. Please provide a concise classic asset descriptor or compact Asset XDR string."
  },
  invalid_issuer: {
    title: "Invalid asset issuer",
    description:
      "The asset issuer must be a valid 56-character Ed25519 public account starting with 'G'. Secret keys starting with 'S' are strictly rejected."
  },
  unsupported_asset_type: {
    title: "Unsupported asset type",
    description:
      "The provided XDR does not decode to a classic Stellar Asset (native, credit_alphanum4, or credit_alphanum12). Liquidity pool shares and non-asset types are not supported."
  }
};
