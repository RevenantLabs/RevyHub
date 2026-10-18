import type { AccountDataEntriesErrorCode } from "@/features/account-data-entries/types";

export const copy = {
  formLabel: "Account address",
  formHint: "Paste a public Stellar account address starting with G.",
  formPlaceholder: "GABC...XYZ",
  submit: "Load data entries",
  loading: "Loading data entries...",
  emptyTitle: "No account loaded yet",
  emptyDescription:
    "Paste an account address to inspect the key/value data stored on the selected network.",
  resultTitle: "Account data entries",
  noEntriesTitle: "This account has no data entries",
  noEntriesDescription:
    "The account exists, but no application data is currently attached to it.",
  columnKey: "Key",
  columnType: "Decoded type",
  columnDecoded: "Decoded value",
  columnRaw: "Raw base64",
  typeText: "Text",
  typeBytes: "Bytes",
  typeInvalid: "Invalid base64",
  invalidBase64: "This value is not valid canonical base64.",
  tableCaption: (accountId: string) => `Data entries attached to account ${accountId}`,
  rawCopyLabel: (key: string) => `${key} raw base64`,
  decodedCopyLabel: (key: string) => `${key} decoded value`,
  entryCount: (count: number) => `${count} data entr${count === 1 ? "y" : "ies"}`
} as const;

export const errorCopy: Record<AccountDataEntriesErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Enter an account address",
    description: "Paste a public Stellar address starting with G to load its data entries."
  },
  invalid_address: {
    title: "That is not a valid account address",
    description:
      "The value failed Stellar's checksum check. Confirm it starts with G and was copied in full."
  },
  account_not_found: {
    title: "This account does not exist on the selected network",
    description:
      "Check the network switch in the header and confirm the account has been funded."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Wait a moment, then try loading the account again."
  },
  request_failed: {
    title: "Could not reach Horizon",
    description: "Check your connection and try loading the account again."
  }
};
