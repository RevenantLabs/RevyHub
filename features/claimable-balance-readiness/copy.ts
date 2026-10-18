import type { ClaimableBalanceReadinessErrorCode } from "@/features/claimable-balance-readiness/types";
import type { ReadinessVerdictKind, BranchOutcome } from "@/features/claimable-balance-readiness/types";

export const copy = {
  balanceLabel: "Claimable balance ID",
  balanceHint: "64 hexadecimal characters identifying the claimable balance on Horizon.",
  balancePlaceholder: "00000000a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef",
  claimantLabel: "Claimant address",
  claimantHint: "Ed25519 public key (starts with G) to check against the balance claimants.",
  claimantPlaceholder: "GABC...XYZ",
  timeLabel: "Evaluation time (UTC)",
  timeHint: "ISO-8601 UTC timestamp used to evaluate absolute and relative predicates.",
  timePlaceholder: "2026-06-01T12:00:00Z",
  submit: "Check claim readiness",
  loading: "Checking claim readiness...",
  emptyTitle: "No claim readiness checked yet",
  emptyDescription:
    "Enter a claimable balance ID, a claimant address and a UTC evaluation time to see whether that claimant appears eligible — without submitting a claim.",
  resultTitle: "Claim readiness",
  amountLabel: "Amount",
  balanceIdLabel: "Balance ID",
  evaluationTimeLabel: "Evaluation time",
  creationTimeLabel: "Creation context",
  creationUnavailable: "Unavailable — relative predicates cannot be decided reliably",
  creationSourceLabel: "Creation source",
  creationSourceValue: "Balance last_modified_time",
  ledgerLabel: "Last modified ledger",
  sponsorLabel: "Sponsor",
  claimantsTitle: "Claimants on this balance",
  selectedClaimantLabel: "Selected claimant",
  predicateTreeTitle: "Predicate tree",
  verdictEligible: "Eligible",
  verdictIneligible: "Ineligible",
  verdictIndeterminate: "Indeterminate",
  verdictNotListed: "Not a claimant",
  verdictEligibleDescription:
    "At the selected UTC time this claimant's predicate evaluates to claimable. This is not a submitted transaction.",
  verdictIneligibleDescription:
    "At the selected UTC time this claimant's predicate is not satisfied. The balance still exists — the claimant is simply not eligible yet (or any longer).",
  verdictIndeterminateDescription:
    "Relative-time predicates need a reliable creation timestamp. Horizon did not provide one that can be trusted, so this tool returns indeterminate instead of guessing.",
  verdictNotListedDescription:
    "This address is not listed among the balance claimants. That is different from a missing balance — the balance was found, but this account cannot claim it.",
  branchSatisfied: "Satisfied",
  branchUnsatisfied: "Not satisfied",
  branchIndeterminate: "Indeterminate",
  selectedBadge: "Selected"
} as const;

export const errorCopy: Record<
  ClaimableBalanceReadinessErrorCode,
  { title: string; description: string }
> = {
  invalid_balance_id: {
    title: "That claimable balance ID is not valid",
    description:
      "Paste the full 64-character hexadecimal balance ID. Remove spaces and make sure you did not paste an account address by mistake."
  },
  invalid_claimant: {
    title: "That claimant address is not valid",
    description:
      "Claimant addresses are Ed25519 public keys that start with G and are 56 characters long. Secret keys starting with S are never accepted."
  },
  invalid_time: {
    title: "That evaluation time is not valid",
    description:
      "Enter a full ISO-8601 UTC timestamp such as 2026-06-01T12:00:00Z. Local-only or incomplete dates are rejected."
  },
  balance_not_found: {
    title: "No claimable balance with this ID on the selected network",
    description:
      "Check the network switch in the header — a testnet balance does not exist on mainnet. This is different from a claimant who simply is not listed on an existing balance."
  },
  unsupported_predicate: {
    title: "This balance uses an unsupported predicate shape",
    description:
      "Horizon returned a claimant predicate this tool does not recognize. Re-check the balance on an explorer; nested shapes beyond unconditional, abs/rel time, AND, OR and NOT are not evaluated."
  },
  request_failed: {
    title: "Could not reach Horizon",
    description: "The request did not complete. Check your connection and try again."
  }
};

export function verdictLabel(kind: ReadinessVerdictKind): string {
  switch (kind) {
    case "eligible":
      return copy.verdictEligible;
    case "ineligible":
      return copy.verdictIneligible;
    case "indeterminate":
      return copy.verdictIndeterminate;
    case "not_listed":
      return copy.verdictNotListed;
  }
}

export function verdictDescription(kind: ReadinessVerdictKind): string {
  switch (kind) {
    case "eligible":
      return copy.verdictEligibleDescription;
    case "ineligible":
      return copy.verdictIneligibleDescription;
    case "indeterminate":
      return copy.verdictIndeterminateDescription;
    case "not_listed":
      return copy.verdictNotListedDescription;
  }
}

export function branchOutcomeLabel(outcome: BranchOutcome): string {
  switch (outcome) {
    case "satisfied":
      return copy.branchSatisfied;
    case "unsatisfied":
      return copy.branchUnsatisfied;
    case "indeterminate":
      return copy.branchIndeterminate;
  }
}
