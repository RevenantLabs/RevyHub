import type { AccountDataEntriesErrorCode, AccountDataValue } from "@/features/account-data-entries/types";

export const copy = {
  formLabel: "Account address",
  formHint:
    "Paste a Stellar public account address starting with G. Account data is public, and secret keys are rejected.",
  formPlaceholder: "GABC...XYZ",
  submit: "Load data entries",
  loading: "Loading data entries...",
  emptyTitle: "No account loaded yet",
  emptyDescription:
    "Paste an account address to inspect every data entry Horizon stores for that account.",
  resultTitle: "Data entries",
  accountLabel: "Account",
  entryCountLabel: "Entries",
  entriesTitle: "Entry details",
  accountCopyLabel: "account address",
  keyColumn: "Key",
  typeColumn: "Type",
  decodedColumn: "Decoded value",
  rawColumn: "Raw base64",
  tableCaption: (accountId: string) => `Data entries stored on account ${accountId}`,
  keyCopyLabel: (key: string) => `data key ${key}`,
  decodedCopyLabel: (key: string) => `decoded value for ${key}`,
  rawCopyLabel: (key: string) => `raw base64 for ${key}`,
  valueKinds: {
    text: "Text",
    bytes: "Bytes",
    invalid_base64: "Invalid"
  } satisfies Record<AccountDataValue["kind"], string>,
  invalidRowsTitle: "One or more entries could not be decoded",
  invalidRowsDescription: (count: number) =>
    count === 1
      ? "One value was not valid base64. The row stays visible so you can inspect the key, and the other entries remain readable."
      : `${count} values were not valid base64. The rows stay visible so you can inspect the keys, and the other entries remain readable.`,
  invalidValueDescription:
    "This value could not be decoded as base64, but the raw string is still visible in the last column.",
  noEntriesTitle: "This account has no data entries",
  noEntriesDescription:
    "The account exists, but Horizon reports no key/value data attached to it."
} as const;

export const errorCopy: Record<
  AccountDataEntriesErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Enter an account address",
    description: "Paste a Stellar address starting with G to inspect its data entries."
  },
  invalid_address: {
    title: "That is not a valid account address",
    description:
      "The value failed Stellar's checksum check. Confirm it starts with G and was copied in full; never paste a secret key."
  },
  account_not_found: {
    title: "This account does not exist on the selected network",
    description:
      "Check the network switch in the header and the account address. An account only exists after it has been funded."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Wait a moment, then try loading the account again."
  },
  request_failed: {
    title: "Could not load this account from Horizon",
    description:
      "The request did not complete. Check your connection and try again. If the problem continues, Horizon may be unavailable."
  }
};
