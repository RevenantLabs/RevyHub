export type PlannedEntryKind =
  | "account"
  | "trustline"
  | "signer"
  | "data"
  | "offer"
  | "claimable_balance";

/** One ledger entry the plan covers, or that is already covered and left alone. */
export interface PlannedEntry {
  id: string;
  kind: PlannedEntryKind;
  reference: string;
  /** Reserve units this entry costs: 2 for the account entry, 1 for every subentry. */
  reserveUnits: number;
  /** Present when the entry is already sponsored by another account. */
  existingSponsor?: string;
}

export type SponsorshipOperation =
  | "begin_sponsoring_future_reserves"
  | "create_account"
  | "change_trust"
  | "set_options"
  | "manage_data"
  | "manage_sell_offer"
  | "create_claimable_balance"
  | "end_sponsoring_future_reserves";

export interface SandwichStep {
  operation: SponsorshipOperation;
  /** Which side of the sponsorship runs the operation. */
  source: "sponsor" | "sponsored";
  /** The target the operation creates or sponsors, when there is one. */
  reference?: string;
}

export interface SponsorshipPlannerInput {
  sponsorAccountId: string;
  sponsoredAccountId: string;
}

export interface SponsorshipPlannerResult {
  sponsorAccountId: string;
  sponsoredAccountId: string;
  /** Base reserve in stroops read from the latest ledger. */
  baseReserveStroops: string;
  /** Whether the sponsored account already exists on the network. */
  sponsoredAccountExists: boolean;
  /** Subentries the plan would newly sponsor, plus the account entry when the account is new. */
  plannedEntries: PlannedEntry[];
  /** Subentries already sponsored by anyone — the plan leaves these untouched. */
  alreadySponsoredEntries: PlannedEntry[];
  /** Reserve units the plan makes the sponsor responsible for. */
  plannedUnits: number;
  /** plannedUnits × base reserve, in stroops. */
  plannedCostStroops: string;
  /** The sponsor's native XLM balance, in stroops. */
  sponsorBalanceStroops: string;
  /** The sponsor's minimum balance before the plan, in stroops. */
  sponsorCurrentMinimumStroops: string;
  /** The sponsor's minimum balance after the plan, in stroops. */
  sponsorResultingMinimumStroops: string;
  /** How much of its resulting minimum the sponsor cannot cover, in stroops. */
  sponsorShortfallStroops: string;
  /** The sponsored account's own minimum balance before the plan, in stroops. */
  sponsoredCurrentMinimumStroops: string;
  /** The sponsored account's own minimum balance after the plan, in stroops. */
  sponsoredResultingMinimumStroops: string;
  /** What the sponsored account must still fund itself, in stroops. */
  sponsoredStillNeedsStroops: string;
  /** The begin/end sponsorship sandwich the plan implies, in order. */
  sandwich: SandwichStep[];
}

export type SponsorshipPlannerErrorCode =
  | "empty_sponsor"
  | "invalid_sponsor"
  | "empty_sponsored"
  | "invalid_sponsored"
  | "same_account"
  | "sponsor_not_found"
  | "ledger_unavailable"
  | "rate_limited"
  | "request_failed";

/** Field a validation error belongs to, so the form can highlight it. */
export type SponsorshipPlannerField = "sponsor" | "sponsored";
