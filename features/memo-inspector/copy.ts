import type { MemoErrorCode, MemoKind, MemoSegmentPart } from "@/features/memo-inspector/types";

export const copy = {
  kindLabel: "Memo type",
  kindHint: "A Stellar transaction carries exactly one memo, of one of these five types.",

  valueLabels: {
    none: "Memo value",
    text: "Memo text",
    id: "Memo ID",
    hash: "Hash",
    return: "Return hash"
  } satisfies Record<MemoKind, string>,

  valueHints: {
    none: "MEMO_NONE carries no value at all.",
    text: "Measured in bytes, not characters — one rocket emoji costs four of the 28.",
    id: "An unsigned 64-bit integer, from 0 to 18446744073709551615. This is the type most exchanges ask for.",
    hash: "32 bytes, written as 64 hex characters or as base64.",
    return: "32 bytes, written as 64 hex characters or as base64. Refers to the transaction being refunded."
  } satisfies Record<MemoKind, string>,

  valuePlaceholders: {
    none: "",
    text: "Invoice 1001",
    id: "1234567890",
    hash: "64 hex characters, or base64",
    return: "64 hex characters, or base64"
  } satisfies Record<MemoKind, string>,

  kindOptions: {
    none: "None (MEMO_NONE)",
    text: "Text (MEMO_TEXT)",
    id: "ID (MEMO_ID)",
    hash: "Hash (MEMO_HASH)",
    return: "Return (MEMO_RETURN)"
  } satisfies Record<MemoKind, string>,

  submit: "Encode memo",
  encoding: "Encoding...",
  encodingStatus: "Encoding the memo",

  emptyTitle: "No memo encoded yet",
  emptyDescription:
    "Pick a memo type, enter a value and see the exact bytes a transaction would carry. Everything happens in your browser — nothing is sent anywhere.",

  resultTitle: "Encoded memo",
  summaryTitle: "Memo",
  typeRow: "Memo type",
  inputRow: "Your input",
  inputEncodingRow: "Read as",
  payloadSizeRow: "Value size",
  totalSizeRow: "Encoded size",
  noValue: "None — MEMO_NONE carries no value",

  xdrTitle: "XDR encoding",
  xdrBase64Label: "Base64",
  xdrHexLabel: "Hex",

  layoutTitle: "Byte layout",
  layoutDescription:
    "The XDR union: a four-byte type discriminant, then the body for that type.",

  decodedTitle: "Decoded back",
  decodedDescription:
    "The bytes above read back through the decoder. If this does not match your input, the encoding is wrong.",
  decodedTypeRow: "Memo type",
  decodedValueRow: "Value",

  hexEncoding: "hex",
  base64Encoding: "base64",

  disclaimer:
    "A memo is public and unencrypted. It travels with the transaction and anyone can read it, so never put a secret key or a password in one."
} as const;

export const segmentLabels: Record<MemoSegmentPart, string> = {
  discriminant: "Type discriminant",
  length: "Length prefix",
  value: "Value",
  padding: "XDR padding"
};

export const segmentNotes: Record<MemoSegmentPart, string> = {
  discriminant: "Which of the five memo types this is.",
  length: "How many bytes of text follow.",
  value: "The value itself.",
  padding: "Zero bytes rounding the field up to a multiple of four."
};

export const errorCopy: Record<MemoErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Enter a memo value",
    description:
      "This memo type carries a value. Type one, or switch the type to None if the transaction should carry no memo."
  },
  text_too_long: {
    title: "The text memo is over 28 bytes",
    description:
      "A text memo holds 28 bytes, not 28 characters. Emoji cost four bytes each and accented letters cost two, so shorten the text until the counter under the field is back within budget."
  },
  invalid_id: {
    title: "That is not a valid memo ID",
    description:
      "A memo ID is a whole number from 0 to 18446744073709551615. Remove any sign, decimal point, spaces or separators — and if your exchange gave you a value with letters in it, it is a hash or text memo, not an ID."
  },
  invalid_hash: {
    title: "That is not 32 bytes",
    description:
      "A hash memo is exactly 32 bytes: 64 hex characters, or base64 that decodes to 32 bytes. Check for a truncated paste or a stray character."
  },
  unsupported_type: {
    title: "That memo type is not recognised",
    description:
      "Stellar has exactly five memo types: none, text, ID, hash and return. Pick one of those."
  },
  decode_failed: {
    title: "The encoded memo could not be read back",
    description:
      "The bytes did not decode into a memo, so the result is not trustworthy. Try the value again, and report it if it keeps happening."
  }
};
