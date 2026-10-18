import type {
  ManageDataErrorCode,
  ManageDataMode,
  ValueEncoding
} from "@/features/manage-data-codec/types";

export const copy = {
  modeLabel: "Mode",
  modeHint:
    "Setting a value and deleting the entry are different operations. A delete carries no value at all; a set carries one, even when it is zero bytes long.",
  modeSet: "Set a value",
  modeDelete: "Delete the entry",

  nameLabel: "Entry name",
  nameHint:
    "Up to 64 bytes of UTF-8. Multibyte characters cost more than one byte each, so the limit is not a character count.",
  valueLabel: "Entry value",
  valueHint: "Up to 64 bytes once decoded. Leave blank for a zero-byte value.",
  encodingLabel: "Value encoding",
  encodingHint: "How the text above should be read before it becomes bytes.",
  submit: "Build operation",
  resetAll: "Reset",

  emptyTitle: "Nothing encoded yet",
  emptyDescription:
    "Enter an entry name — and a value, unless you are deleting — to see its exact byte lengths, every encoding of it, and the operation XDR it produces.",

  nameTitle: "Name",
  valueTitle: "Value",
  operationTitle: "Operation XDR",
  decodedTitle: "Decoded back from the XDR",

  labelByteLength: "Byte length",
  labelCharacterLength: "Character length",
  labelHex: "Hex",
  labelBase64: "Base64",
  labelUtf8: "UTF-8 text",
  labelMode: "Mode",
  labelValuePresent: "Value present",
  labelDecodedName: "Name",
  labelDecodedValue: "Value",

  deleteTitle: "This is a deletion",
  deleteDescription:
    "The operation carries no value at all. That is not the same as setting an empty value: a delete removes the entry and releases its base reserve, while a zero-byte set keeps the entry alive with nothing in it.",
  emptyValueTitle: "This sets a zero-byte value",
  emptyValueDescription:
    "The entry will exist and hold no bytes. To remove it instead, switch to delete mode.",

  binaryNotice:
    "These bytes are not valid UTF-8, so only the hex is shown. Rendering an invalid decoding would invent characters that are not in the data.",
  controlNotice:
    "These bytes decode to text containing control characters. The hex is authoritative; the text preview has them escaped so they cannot affect the page.",
  multibyteNotice:
    "This name uses more bytes than characters. The 64-byte protocol limit counts bytes, so the character count below is shown only to make the difference visible — it is not the bound.",

  xdrNote:
    "This is a standalone, unsigned manage-data operation. It is not a transaction: it has no source account, sequence number, fee or signature, and it cannot be submitted as it stands.",
  roundTripNote:
    "The panel below is decoded back out of the XDR above, not copied from the form, so what you see is what the bytes actually say.",

  valuePresentYes: "Yes — a value is set",
  valuePresentNo: "No — the entry is deleted",
  noText: "Not shown — see hex",

  copyName: "entry name",
  copyHex: "hex value",
  copyBase64: "base64 value",
  copyXdr: "operation XDR"
} as const;

export const modeLabels: Record<ManageDataMode, string> = {
  set: copy.modeSet,
  delete: copy.modeDelete
};

export const encodingLabels: Record<ValueEncoding, string> = {
  utf8: "UTF-8 text",
  hex: "Hex",
  base64: "Base64"
};

export const errorCopy: Record<ManageDataErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Give the entry a name",
    description:
      "A manage-data operation always names the entry it acts on, whether it is setting a value or deleting one."
  },
  invalid_input: {
    title: "That input cannot be used",
    description:
      "The entry name and value must be plain text this tool can read before encoding. A secret key is refused outright and cleared from the field: a data entry is published on the ledger and readable by anyone, forever."
  },
  input_too_large: {
    title: "That input is too long to process",
    description:
      "The raw text is capped at 4,096 characters before decoding. Hex and base64 are longer than the bytes they encode, but not by that much — anything this size is not a 64-byte data entry."
  },
  name_too_long: {
    title: "The name is over 64 bytes",
    description:
      "The protocol limit is 64 UTF-8 bytes, not 64 characters. Accented letters cost two bytes, most CJK characters three and many emoji four, so a short-looking name can still be over. Shorten it until the byte count below is 64 or less."
  },
  value_too_long: {
    title: "The value is over 64 bytes",
    description:
      "The protocol limit is 64 bytes once decoded. Hex halves as it decodes and base64 shrinks by about a quarter, so check the decoded byte count rather than the length of what you typed."
  },
  invalid_encoding: {
    title: "That value cannot be decoded",
    description:
      "Hex needs an even number of characters from 0-9 and a-f. Base64 needs A-Z, a-z, 0-9, + and / with = padding and a length that is a multiple of four. Switch the encoding to UTF-8 if you meant to enter the value as text."
  }
};
