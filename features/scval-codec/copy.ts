import type { ScvalCodecErrorCode } from "@/features/scval-codec/types";

export const copy = {
  formLabel: "ScVal input",
  formHint:
    "In decode mode, paste a base64 ScVal. In encode mode, paste JSON in the canonical ScVal JSON format.",
  modeLabel: "Direction",
  modeDecode: "Decode base64 → JSON",
  modeEncode: "Encode JSON → base64",
  submit: "Convert",
  emptyTitle: "Nothing to convert yet",
  emptyDescription:
    "Choose decode or encode, paste your value, and click Convert to see the result.",
  resultTitle: "Converted result",
  decodedTitle: "Decoded ScVal",
  encodedTitle: "Encoded ScVal",
  downloadJson: "Download JSON",
  copyBase64: "Copy base64"
} as const;

export const errorCopy: Record<
  ScvalCodecErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Enter a value first",
    description: "Paste a base64 ScVal or JSON object before converting."
  },
  invalid_base64: {
    title: "Invalid base64",
    description: "The input could not be decoded as base64. Check for typos or missing characters."
  },
  invalid_scval: {
    title: "Invalid ScVal",
    description: "The base64 decoded, but it is not a valid Soroban ScVal."
  },
  invalid_json: {
    title: "Invalid JSON",
    description: "The input is not valid JSON, or a number is out of range for its declared type."
  },
  unsupported_type: {
    title: "Unsupported ScVal type",
    description:
      "This value uses an ScVal type the codec does not handle yet (e.g. contract instance or ledger key nonce)."
  },
  request_failed: {
    title: "Conversion failed",
    description: "An unexpected error occurred. Check the input and try again."
  }
};
