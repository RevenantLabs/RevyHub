import type { ErrorCode, LivenessState } from "./types";

export const copy = {
  title: "Soroban Storage Restore Readiness",
  description:
    "Check whether a contract's storage entry is live, past its live-until ledger but not yet evicted, or fully archived — and what a RestoreFootprint operation would need to bring an archived persistent entry back.",
  submit: "Check readiness",
  loading: "Reading the ledger entry…",
  reset: "Reset",
  emptyTitle: "Enter a contract and storage key",
  emptyDescription: "The lookup is read-only and never constructs or submits a transaction.",
  resultTitle: "Restore readiness",
  rejected: "Secret keys are discarded and never sent.",
  fields: {
    contractId: {
      label: "Contract ID",
      hint: "A C… contract ID on the network selected in the header."
    },
    storageKeyXdr: {
      label: "Storage key (ScVal, base64 XDR)",
      hint: "Paste the exact ScVal XDR used as the contract_data key — for example, a Symbol encoded as base64."
    },
    durability: {
      label: "Durability",
      hint: "Persistent entries can be restored once archived. Temporary entries cannot."
    }
  },
  durabilityOptions: {
    persistent: "Persistent",
    temporary: "Temporary"
  },
  livenessLabels: {
    live: "Live",
    pending_eviction: "Expired, not yet evicted",
    archived: "Archived",
    expired_temporary: "Expired (temporary — not restorable)"
  } satisfies Record<LivenessState["kind"], string>,
  restorableTitle: "Restorable with a RestoreFootprint operation",
  notRestorableTitle: "Not restorable",
  currentLedger: "Current ledger",
  liveUntilLedger: "Live-until ledger",
  liveUntilUnknown: "Not reported by this lookup",
  remaining: "Remaining",
  temporaryExpiredTitle: "Expired and deleted",
  temporaryExpiredDescription:
    "Temporary entries are deleted once expired. There is no on-chain trace left to restore — this result reflects that, not a lookup failure."
} as const;

export const errorCopy: Record<ErrorCode, { title: string; description: string }> = {
  invalid_contract_id: {
    title: "Invalid contract ID",
    description: "Enter a C… contract ID. Secret seeds are rejected before any request."
  },
  invalid_storage_key: {
    title: "Invalid storage key",
    description: "Enter the storage key as base64-encoded ScVal XDR — the exact value used as the contract_data key."
  },
  entry_not_found: {
    title: "No entry and no archive record",
    description:
      "The network returned no live row and no archive marker for this key. It may never have existed, or the " +
      "connected RPC endpoint does not expose archived entries for it — try an archival RPC endpoint or double-check the key."
  },
  history_unavailable: {
    title: "Ledger history unavailable",
    description: "The RPC endpoint reported that it no longer retains the history needed to answer this lookup. Try an archival RPC endpoint."
  },
  rate_limited: {
    title: "Rate limited",
    description: "The RPC endpoint is throttling requests. Wait a moment and try again."
  },
  request_failed: {
    title: "Ledger entry request failed",
    description: "The RPC endpoint did not return the entry. Check the selected network and try again."
  }
};
