import type { AccountMergePreflightErrorCode } from "@/features/account-merge-preflight/types";

export const copy = {
  formSourceLabel: "Source Account",
  formSourceHint: "The Stellar account you want to merge",
  formDestinationLabel: "Destination Account",
  formDestinationHint: "The Stellar account to receive the funds",
  submit: "Check Preflight",
  emptyTitle: "No preflight run",
  emptyDescription: "Enter a source and destination account to check if the source can be merged.",
  resultTitle: "Account Merge Preflight Result",
  mergeableTitle: "Account is ready to merge",
  mergeableDescription: "No blocking items were found.",
  notMergeableTitle: "Account cannot be merged yet",
  notMergeableDescription: "Resolve the following blocking items before attempting to merge the account:"
} as const;

export const errorCopy: Record<AccountMergePreflightErrorCode, { title: string; description: string }> = {
  empty_source: {
    title: "Source account is required",
    description: "Please provide a valid source account address."
  },
  invalid_source: {
    title: "Invalid source account",
    description: "The source account must be a valid Ed25519 public key (starts with G)."
  },
  empty_destination: {
    title: "Destination account is required",
    description: "Please provide a valid destination account address."
  },
  invalid_destination: {
    title: "Invalid destination account",
    description: "The destination account must be a valid Ed25519 public key (starts with G)."
  },
  same_account: {
    title: "Same account",
    description: "Source and destination accounts cannot be the same."
  },
  source_not_found: {
    title: "Source not found",
    description: "The source account does not exist on this network."
  },
  destination_not_found: {
    title: "Destination not found",
    description: "The destination account does not exist on this network."
  },
  request_failed: {
    title: "Network error",
    description: "Could not reach Horizon to check the accounts. Please try again."
  }
};
