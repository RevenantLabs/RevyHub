import type {
  AccountMergeBlocker,
  AccountMergeCheckId,
  AccountMergePreflightErrorCode
} from "@/features/account-merge-preflight/types";

export const copy = {
  sourceLabel: "Source account",
  sourceHint: "The public G-address to close and remove from the selected network.",
  sourcePlaceholder: "Source G-address",
  destinationLabel: "Destination account",
  destinationHint: "The existing public G-address that would receive the source account’s XLM.",
  destinationPlaceholder: "Destination G-address",
  submit: "Run merge preflight",
  loading: "Checking both accounts and all offers...",
  emptyTitle: "No merge preflight yet",
  emptyDescription: "Enter different source and destination accounts to identify every visible merge blocker before building a transaction.",
  mergeableTitle: "Account is mergeable",
  mergeableDescription: "Every precondition visible through the required Horizon account and offer endpoints currently passes.",
  blockedTitle: "Account is not mergeable yet",
  blockedDescription: "Resolve every concrete blocker below before attempting an account-merge operation.",
  snapshotNote: "This is a read-only snapshot. Balances, offers, signers and sponsorships can change before a transaction is submitted.",
  detailsTitle: "Merge snapshot",
  checksTitle: "Precondition checklist",
  blockersTitle: "Concrete blockers",
  sourceAccount: "Source",
  destinationAccount: "Destination",
  transferableXlm: "Current XLM that would transfer",
  maximumReceivableXlm: "Destination’s current XLM receiving capacity",
  signerWeight: "Configured / required high-threshold weight",
  sponsoredSubentries: "Source subentries sponsored by others",
  sponsoredSubentriesNote: "Sponsored-for-source entries are reported for context but are not sponsorship obligations of the source account.",
  pass: "Pass",
  blocked: "Blocked",
  noBlockers: "No blockers found.",
  reset: "Check another pair",
  xlmSuffix: "XLM",
  copySource: "source account",
  copyDestination: "destination account"
} as const;

export const checkCopy: Record<
  AccountMergeCheckId,
  { title: string; passed: string; failed: string }
> = {
  destination_exists: {
    title: "Destination exists",
    passed: "Horizon found the destination on the selected network.",
    failed: "The destination must exist before it can receive a merge."
  },
  trustlines: {
    title: "No remaining trustlines or pool shares",
    passed: "The source holds only its native XLM balance.",
    failed: "Remove each listed trustline or liquidity-pool share first."
  },
  offers: {
    title: "No open offers",
    passed: "All paginated offer pages are empty.",
    failed: "Cancel each listed offer before merging."
  },
  data_entries: {
    title: "No account data entries",
    passed: "The source has no manage-data entries.",
    failed: "Delete each named data entry before merging."
  },
  sponsorships: {
    title: "No sponsorship obligations",
    passed: "The source is not sponsoring reserves for other ledger entries.",
    failed: "End or transfer the source account’s listed sponsorship obligations."
  },
  signer_weight: {
    title: "High-threshold authorization is possible",
    passed: "The configured signer weights can meet the account-merge operation’s high threshold.",
    failed: "Increase or restore enough signer weight to meet the high threshold."
  },
  immutable_auth: {
    title: "Authorization is not immutable",
    passed: "The source does not have AUTH_IMMUTABLE set.",
    failed: "AUTH_IMMUTABLE is permanent; an account with this flag cannot be merged."
  },
  destination_capacity: {
    title: "Destination can receive the source balance",
    passed: "The transfer fits below int64 maximum after destination buying liabilities.",
    failed: "Choose a destination with enough receiving capacity for the listed XLM balance."
  }
};

export function describeBlocker(blocker: AccountMergeBlocker): string {
  switch (blocker.kind) {
    case "trustline":
      return blocker.subentryType === "liquidity_pool"
        ? `Liquidity-pool share ${blocker.asset}, balance ${blocker.balance}`
        : `Trustline ${blocker.asset}, balance ${blocker.balance}`;
    case "offer":
      return `Offer ${blocker.id}: selling ${blocker.selling} for ${blocker.buying}`;
    case "data_entry":
      return `Data entry “${blocker.name}”`;
    case "sponsorship":
      return `${blocker.count} sponsored reserve entr${blocker.count === 1n ? "y" : "ies"} for other accounts`;
    case "signer_weight":
      return `Configured signer weight ${blocker.configured}; high threshold ${blocker.required}`;
    case "immutable_auth":
      return "AUTH_IMMUTABLE is set on the source account";
    case "destination_capacity":
      return `Source would transfer ${blocker.transferableXlm} XLM, but the destination can currently receive at most ${blocker.maximumReceivableXlm} XLM`;
  }
}

export const errorCopy: Record<AccountMergePreflightErrorCode, { title: string; description: string }> = {
  empty_source: {
    title: "Enter the source account",
    description: "Paste the public G-address of the account you want to close."
  },
  invalid_source: {
    title: "The source address is invalid",
    description: "Check the public G-address for missing or changed characters. Never enter a secret key."
  },
  empty_destination: {
    title: "Enter the destination account",
    description: "Paste the public G-address that should receive the source account’s XLM."
  },
  invalid_destination: {
    title: "The destination address is invalid",
    description: "Check the public G-address for missing or changed characters. Never enter a secret key."
  },
  same_account: {
    title: "Choose a different destination",
    description: "An account cannot merge into itself. Enter another existing account on this network."
  },
  source_not_found: {
    title: "Source account not found on this network",
    description: "Check the source address and network selector, then try again."
  },
  destination_not_found: {
    title: "Destination account not found on this network",
    description: "Create or fund the destination on this network, or enter a different existing account."
  },
  request_failed: {
    title: "Could not complete the Horizon preflight",
    description: "Check your connection and retry. If it continues, wait for the selected network’s Horizon service to recover."
  }
};
