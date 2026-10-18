/** Validated request after schema parsing. */
export interface ClaimableBalanceReadinessInput {
  balanceId: string;
  claimant: string;
  /** ISO-8601 UTC instant used for predicate evaluation. */
  evaluationTime: string;
}

export type ClaimableBalanceReadinessErrorCode =
  | "invalid_balance_id"
  | "invalid_claimant"
  | "invalid_time"
  | "balance_not_found"
  | "unsupported_predicate"
  | "request_failed";

/** Field a validation error belongs to, so the form can highlight it. */
export type ClaimableBalanceReadinessField = "balanceId" | "claimant" | "evaluationTime";

export interface ClaimableBalanceAsset {
  kind: "native" | "credit";
  assetCode?: string;
  assetIssuer?: string;
  label: string;
}

/** Overall readiness for the selected claimant at the evaluation time. */
export type ReadinessVerdictKind =
  | "eligible"
  | "ineligible"
  | "indeterminate"
  | "not_listed";

export type BranchOutcome = "satisfied" | "unsatisfied" | "indeterminate";

export type PredicateKind =
  | "unconditional"
  | "abs_before"
  | "abs_after"
  | "rel_before"
  | "rel_after"
  | "and"
  | "or"
  | "not";

/** A single evaluated node in the claimant's predicate tree. */
export interface PredicateTreeNode {
  kind: PredicateKind;
  /** Plain-language description of what this branch requires. */
  label: string;
  /** Why this branch evaluated the way it did at the selected time. */
  explanation: string;
  outcome: BranchOutcome;
  children?: PredicateTreeNode[];
}

export interface TimeContextSummary {
  evaluationTime: string;
  evaluationTimeMs: number;
  creationTime: string | null;
  creationTimeMs: number | null;
  creationReliable: boolean;
  creationSource: "last_modified_time" | "unavailable";
}

export interface ClaimantSummary {
  destination: string;
  selected: boolean;
  verdict: ReadinessVerdictKind;
  predicateTree: PredicateTreeNode | null;
}

export interface ClaimableBalanceReadinessResult {
  balanceId: string;
  amount: string;
  asset: ClaimableBalanceAsset;
  sponsor?: string;
  lastModifiedLedger: number;
  timeContext: TimeContextSummary;
  selectedClaimant: string;
  selectedVerdict: ReadinessVerdictKind;
  selectedTree: PredicateTreeNode | null;
  claimants: ClaimantSummary[];
}
