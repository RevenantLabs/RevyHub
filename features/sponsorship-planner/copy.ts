import type {
  PlannedEntryKind,
  SponsorshipOperation,
  SponsorshipPlannerErrorCode
} from "@/features/sponsorship-planner/types";

export const copy = {
  sponsorLabel: "Sponsor address",
  sponsorHint: "The account that will pay the reserves. It must already exist on",
  sponsorPlaceholder: "GABC...XYZ",
  sponsoredLabel: "Sponsored account address",
  sponsoredHint: "The account being onboarded. It does not need to exist yet on",
  sponsoredPlaceholder: "GABC...XYZ",
  submit: "Plan sponsorship",
  loading: "Planning sponsorship...",
  emptyTitle: "No sponsorship planned yet",
  emptyDescription:
    "Enter a sponsor and a sponsored account to see which subentries the sponsor covers, what reserve it costs, and what the sponsored account is left needing.",
  resultTitle: "Sponsorship plan",
  baseReserveLabel: "Base reserve",
  plannedCostLabel: "Reserve cost to sponsor",
  plannedCostDescription: "Reserve units the sponsor takes on.",
  plannedSubentriesTitle: "Subentries the sponsor would cover",
  plannedSubentriesDescription:
    "Unsponsored subentries the plan makes the sponsor responsible for, itemised by kind.",
  newAccountNote:
    "This is a brand-new account, so there are no subentries yet. The plan covers its account entry with a sponsored create_account.",
  allSponsoredTitle: "Everything is already sponsored",
  allSponsoredDescription:
    "This account's subentries all have a sponsor already, so the plan has nothing new to cover.",
  alreadySponsoredTitle: "Already sponsored — left untouched",
  alreadySponsoredDescription:
    "These entries already have a sponsor, so the plan does not re-sponsor them.",
  sponsorSectionTitle: "Sponsor's minimum balance",
  sponsorSectionDescription:
    "Includes the sponsor's own entries and the subentries it already sponsors.",
  sponsorBalanceLabel: "Sponsor balance",
  sponsorCurrentLabel: "Current minimum",
  sponsorResultingLabel: "After the plan",
  sponsorShortfallLabel: "Shortfall",
  sponsorCoveredLabel: "Plan covered",
  coveredDescription: "The sponsor's balance covers the plan's reserve cost.",
  sponsoredSectionTitle: "Sponsored account's minimum balance",
  sponsoredSectionDescription: "Reserve the sponsored account must fund itself.",
  sponsoredCurrentLabel: "Current minimum",
  sponsoredResultingLabel: "After the plan",
  sponsoredStillNeedsLabel: "Still needs",
  sponsoredStillNeedsDescription:
    "Reserve the sponsored account must still fund itself after the plan.",
  sandwichTitle: "Operation order",
  sandwichDescription:
    "Only operations inside the begin/end sandwich are sponsored; anything outside it is not.",
  sandwichNote: "Operations executed outside the sandwich are not sponsored.",
  columnKind: "Kind",
  columnEntry: "Entry",
  columnCost: "Reserve cost",
  columnSponsor: "Existing sponsor",
  accountSectionLabel: (accountId: string) => `Plan for ${accountId}`,
  entryKinds: {
    account: "Account entry",
    trustline: "Trustline",
    signer: "Signer",
    data: "Data entry",
    offer: "Offer",
    claimable_balance: "Claimable balance"
  } satisfies Record<PlannedEntryKind, string>,
  operationNames: {
    begin_sponsoring_future_reserves: "begin_sponsoring_future_reserves",
    create_account: "create_account",
    change_trust: "change_trust",
    set_options: "set_options",
    manage_data: "manage_data",
    manage_sell_offer: "manage_sell_offer",
    create_claimable_balance: "create_claimable_balance",
    end_sponsoring_future_reserves: "end_sponsoring_future_reserves"
  } satisfies Record<SponsorshipOperation, string>,
  sandwichSource: {
    sponsor: "Sponsor",
    sponsored: "Sponsored account"
  },
  shortfallMessage: (shortfall: string) =>
    `The sponsor is ${shortfall} short of its resulting minimum balance.`,
  sandwichStepLabel: (index: number) => `Step ${index}`,
  copySponsorLabel: (reference: string) => `sponsor for ${reference}`
} as const;

export const errorCopy: Record<
  SponsorshipPlannerErrorCode,
  { title: string; description: string }
> = {
  empty_sponsor: {
    title: "Enter a sponsor address",
    description:
      "Paste the public Stellar address of the account that will pay the reserves."
  },
  invalid_sponsor: {
    title: "That is not a valid sponsor address",
    description:
      "The value failed Stellar's checksum check. Confirm it starts with G and was copied in full."
  },
  empty_sponsored: {
    title: "Enter a sponsored account address",
    description: "Paste the public Stellar address of the account being onboarded."
  },
  invalid_sponsored: {
    title: "That is not a valid sponsored account address",
    description:
      "The value failed Stellar's checksum check. Confirm it starts with G and was copied in full."
  },
  same_account: {
    title: "The sponsor and sponsored account are the same",
    description:
      "Sponsorship needs two different accounts. An account cannot sponsor itself."
  },
  sponsor_not_found: {
    title: "The sponsor does not exist on the selected network",
    description:
      "A sponsor must be funded before it can pay reserves. Check the network switch in the header and confirm the address is funded there."
  },
  ledger_unavailable: {
    title: "Could not read the current base reserve",
    description:
      "Horizon did not return a ledger with a base reserve. Try again in a moment."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Wait a moment, then plan the sponsorship again."
  },
  request_failed: {
    title: "Could not plan the sponsorship",
    description: "Check your connection and try again."
  }
};
