import type { SimulationExplainerErrorCode } from "@/features/simulation-explainer/types";

export const copy = {
  formLabel: "Transaction envelope XDR",
  formHint:
    "Paste a base64-encoded Soroban transaction envelope. The tool simulates it against the selected network without submitting it.",
  submit: "Simulate transaction",
  loading: "Simulating transaction...",
  emptyTitle: "No transaction simulated yet",
  emptyDescription:
    "Paste a Soroban transaction envelope to see its simulated resource usage, fees, auth requirements, or why it would fail.",
  resultTitle: "Simulation result",
  outcomeLabel: "Outcome",
  latestLedgerLabel: "Latest ledger",
  minResourceFeeLabel: "Minimum resource fee",
  baseFeeLabel: "Base fee",
  baseFeeNote: "The base network fee is separate from the Soroban resource fee shown above.",
  resourcesTitle: "Resource usage",
  cpuInstructionsLabel: "CPU instructions",
  memoryBytesLabel: "Memory bytes",
  readBytesLabel: "Read bytes",
  writeBytesLabel: "Write bytes",
  ledgerReadEntriesLabel: "Ledger entries read",
  ledgerWriteEntriesLabel: "Ledger entries written",
  ledgerEntryReadBytesLabel: "Ledger entry read bytes",
  ledgerEntryWriteBytesLabel: "Ledger entry write bytes",
  authTitle: "Required authorizations",
  noAuthTitle: "No authorizations required",
  returnValueLabel: "Return value",
  eventsTitle: "Events",
  noEventsTitle: "No events",
  errorCodeLabel: "Error code",
  errorMessageLabel: "Error message",
  restoreTitle: "Archived state must be restored first",
  restoreDescription:
    "The simulation found archived ledger entries that must be restored before the transaction can succeed.",
  xdrPlaceholder: "AAAA..."
} as const;

export const errorCopy: Record<
  SimulationExplainerErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Enter a transaction envelope",
    description: "Paste a base64-encoded Soroban transaction envelope to simulate it."
  },
  invalid_xdr: {
    title: "That is not a valid transaction envelope",
    description:
      "The input could not be decoded as a Stellar transaction envelope. Check that it is complete base64 XDR."
  },
  simulation_failed: {
    title: "The simulation could not be parsed",
    description: "The RPC node returned a response this tool could not understand. Try again later."
  },
  restore_required: {
    title: "Archived entries must be restored",
    description:
      "The simulation reports archived state. Restore the listed entries and re-simulate before submitting."
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
