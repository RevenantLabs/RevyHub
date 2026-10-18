import type { ErrorCode } from "./types";

export const copy = {
  title: "Contract Code Hash Verifier",
  description: "Read a contract instance and its Wasm code entry, then compare SHA-256 of the returned bytes with the hash the instance names.",
  submit: "Verify code hash",
  loading: "Reading ledger entries…",
  reset: "Reset",
  emptyTitle: "Enter a contract ID",
  emptyDescription: "The lookup is read-only. A matching hash does not mean the code is safe to invoke.",
  resultTitle: "Hash comparison",
  rejected: "Secret keys are discarded and never sent.",
  notAtomic: "The two reads reported different latest ledgers, so this is not an atomic snapshot.",
  atomic: "Both reads reported the same latest ledger.",
  fields: {
    contractId: {
      label: "Contract ID",
      hint: "A C… contract ID on the network selected in the header."
    }
  },
  verdicts: {
    match: "The Wasm bytes hash to the digest named by the instance.",
    mismatch: "The Wasm bytes do not hash to the digest named by the instance.",
    not_applicable: "This instance is a built-in Stellar Asset Contract and has no Wasm hash."
  }
} as const;

export const errorCopy: Record<ErrorCode, { title: string; description: string }> = {
  invalid_contract_id: {
    title: "Invalid contract ID",
    description: "Enter a C… contract ID. Secret seeds are rejected before any request."
  },
  entry_missing: {
    title: "Ledger entry is missing",
    description: "This network has no contract instance or code entry for that key. Check the contract ID and the selected network."
  },
  entry_archived: {
    title: "Ledger entry is archived",
    description: "The entry's live-until ledger is behind the latest ledger. This tool does not restore it."
  },
  malformed_entry: {
    title: "Ledger entry could not be decoded",
    description: "The XDR was not a contract instance or contract code entry. Try the lookup again on the selected network."
  },
  entry_oversized: {
    title: "Wasm entry is too large",
    description: "The code entry is larger than 131072 bytes, so it was not hashed. Narrow the lookup to a smaller contract."
  },
  request_failed: {
    title: "Ledger entry request failed",
    description: "The RPC endpoint did not return the entry. Check the selected network and try again."
  }
};
