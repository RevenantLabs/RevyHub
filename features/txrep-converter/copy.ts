import type { TxrepConverterErrorCode } from "@/features/txrep-converter/types";

export const copy = {
  inputLabel: "Envelope",
  inputHint: "Paste base64 XDR or SEP-0011 Txrep. The format is detected locally.",
  submit: "Convert",
  loading: "Converting locally...",
  emptyTitle: "No envelope pasted yet",
  emptyDescription: "Paste a transaction envelope. Conversion stays in this browser and does not sign or submit anything.",
  resultTitle: "Converted envelope",
  detectedLabel: "Detected format",
  xdrLabel: "Base64 XDR",
  txrepLabel: "Txrep",
  fieldCountLabel: "Fields",
  outputXdr: "Base64 XDR",
  outputTxrep: "SEP-0011 Txrep",
  roundTripOk: "Round trip matched the original bytes.",
  roundTripFailed: "Round trip did not match. The converted text is hidden so a lossy result is not shown."
} as const;

export const errorCopy: Record<TxrepConverterErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Paste an envelope first",
    description: "The field is empty. Paste base64 XDR or Txrep text."
  },
  invalid_xdr: {
    title: "That is not a transaction envelope",
    description: "The text is not valid base64 transaction XDR. Secret seeds are rejected and never converted."
  },
  invalid_txrep: {
    title: "That Txrep text cannot be compiled",
    description: "A required key is missing or a value has the wrong type. Check the field paths and try again."
  },
  unsupported_envelope: {
    title: "This envelope type is not supported",
    description: "Only v0, v1, and fee-bump transaction envelopes can be converted."
  },
  too_large: {
    title: "That envelope is too large",
    description: "Paste at most 64 KiB of text."
  }
};
