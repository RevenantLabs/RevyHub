import type { ContractStorageErrorCode } from "@/features/contract-storage/types";

export const copy = {
  formLabel: "Contract ID",
  formHint:
    "Paste a Soroban contract ID starting with C. Storage and TTL are read from the selected network's RPC node.",
  submit: "Inspect storage",
  loading: "Reading contract storage...",
  emptyTitle: "No contract inspected yet",
  emptyDescription:
    "Paste a Soroban contract ID to see its instance storage and the TTL of its ledger entries.",
  resultTitle: "Contract storage",
  latestLedgerLabel: "Latest ledger",
  ttlNote:
    "Ledger close time is estimated at ~5 seconds per ledger. TTL is reported as ledgers remaining and an approximate wall-clock countdown.",
  noEntriesTitle: "No readable storage entries",
  noEntriesDescription:
    "The contract instance was found, but it reports no instance storage entries. Persistent and temporary entries require their individual ledger keys and cannot be enumerated from the contract ID alone.",
  instanceSectionTitle: "Instance storage",
  persistentSectionTitle: "Persistent storage",
  temporarySectionTitle: "Temporary storage",
  keyColumn: "Key",
  valueColumn: "Value",
  liveUntilColumn: "Live until ledger",
  remainingColumn: "Ledgers remaining",
  archivedBadge: "Archived",
  persistentNote:
    "Persistent and temporary entries are stored as separate ledger entries and cannot be listed with only the contract ID.",
  contractIdLabel: "Contract ID",
  entriesCountLabel: "Storage entries"
} as const;

export const errorCopy: Record<
  ContractStorageErrorCode,
  { title: string; description: string }
> = {
  empty_contract_id: {
    title: "Enter a contract ID",
    description: "Paste a Soroban contract ID starting with C to inspect its storage and TTL."
  },
  invalid_contract_id: {
    title: "That is not a valid contract ID",
    description:
      "The value failed the contract-address checksum. Confirm it starts with C and was copied in full."
  },
  contract_not_found: {
    title: "This contract has no readable entries on the selected network",
    description:
      "The RPC node returned no ledger entries for this contract. Check the network switch, or verify the contract has been deployed."
  },
  rpc_error: {
    title: "The RPC node returned an error",
    description: "The Soroban RPC endpoint reported a problem. Wait a moment and try again."
  },
  request_failed: {
    title: "Could not reach the RPC node",
    description: "The request did not complete. Check your connection and try again."
  }
};
