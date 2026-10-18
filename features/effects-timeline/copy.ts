import type {
  EffectCategory,
  EffectFieldKey,
  EffectsTimelineErrorCode
} from "@/features/effects-timeline/types";

export const copy = {
  formLabel: "Account address",
  formHint:
    "Paste a public Stellar account address starting with G. The timeline is read only — never paste a secret key.",
  formPlaceholder: "GABC...XYZ",
  submit: "Show effects timeline",
  loading: "Loading effects...",

  emptyTitle: "No timeline loaded yet",
  emptyDescription:
    "Paste an account address to see the ledger changes it experienced, grouped by the transaction that caused them.",

  summaryTitle: "Effects on this account",
  accountLabel: "Account",
  effectsOnPageLabel: "Effects on this page",
  balanceEffectsLabel: "Balance changes",
  configurationEffectsLabel: "Configuration changes",
  transactionsOnPageLabel: "Transactions on this page",

  multiEffectTitle: "One operation, several effects",
  multiEffectDescription:
    "An operation says what was requested; the ledger reports every change it caused. A path payment, for example, debits the sender, records each offer it crossed and credits the receiver — three effects the operation never named individually.",
  multiEffectExample: (count: number, ledger: number, operationIndex: number) =>
    `In this timeline, operation ${operationIndex} of the transaction in ledger ${ledger} produced ${count} effects on its own.`,
  multiEffectNoExample:
    "Every operation on this page produced exactly one effect. Page further back to find an operation that produced several.",

  noEffectsTitle: "Horizon returned no effects for this account",
  noEffectsDescription:
    "The account exists on the selected network but has no recorded effects. Check the network switch in the header if you expected history here.",

  timelineLabel: "Transactions, newest first",
  operationsLabel: "Operations in this transaction",
  effectsLabel: "Effects this operation produced",

  transactionHeading: (ledger: number, transactionIndex: number) =>
    `Ledger ${ledger} · transaction ${transactionIndex}`,
  transactionMeta: (effects: number, operations: number) =>
    `${effects} ${effects === 1 ? "effect" : "effects"} from ${operations} ${
      operations === 1 ? "operation" : "operations"
    }`,
  operationHeading: (operationIndex: number) => `Operation ${operationIndex}`,
  operationMeta: (effects: number) =>
    effects === 1 ? "1 effect" : `${effects} effects from this one operation`,

  continuedFromNewerPage:
    "Continued from the previous page — this transaction's later effects are shown there.",
  continuesOnOlderPage:
    "This transaction continues on the next page — its earlier effects are shown there.",

  categoryLabels: {
    balance: "Balance change",
    configuration: "Configuration change"
  } satisfies Record<EffectCategory, string>,

  fieldLabels: {
    amount: "Amount",
    startingBalance: "Starting balance",
    sold: "Sold",
    bought: "Bought",
    seller: "Counterparty",
    offerId: "Offer",
    asset: "Asset",
    trustLimit: "Trust limit",
    trustor: "Trustor",
    signerKey: "Signer",
    signerWeight: "Weight",
    thresholds: "Thresholds (low / medium / high)",
    flags: "Flags",
    homeDomain: "Home domain",
    inflationDestination: "Inflation destination",
    dataName: "Data entry",
    newSequence: "New sequence number",
    balanceId: "Claimable balance",
    sponsor: "Sponsor",
    newSponsor: "New sponsor",
    formerSponsor: "Former sponsor",
    liquidityPool: "Liquidity pool",
    contract: "Contract"
  } satisfies Record<EffectFieldKey, string>,

  /** Overrides where the effect type's own wording reads badly. */
  effectTypeLabels: {
    trade: "Trade (an offer was crossed)",
    sequence_bumped: "Sequence number bumped",
    data_created: "Data entry created",
    data_updated: "Data entry updated",
    data_removed: "Data entry removed"
  } as Record<string, string>,

  flagLabels: {
    auth_required: "Authorisation required",
    auth_revocable: "Authorisation revocable",
    auth_immutable: "Authorisation immutable",
    auth_clawback_enabled: "Clawback enabled"
  } as Record<string, string>,
  flagOn: "on",
  flagOff: "off",
  noFlags: "No flags reported",

  nativeAsset: "XLM",
  unknownAsset: "Unknown asset",
  clearedValue: "Cleared",

  pagerLabel: "Timeline paging",
  newerPage: "Newer effects",
  olderPage: "Older effects",
  pagePosition: (pageNumber: number) => `Page ${pageNumber}`,
  atNewestEnd: "You are on the newest page.",
  atOldestEnd: "You have reached the oldest recorded effect.",
  pageSizeNote: (size: number) => `Up to ${size} effects per page, newest first.`
} as const;

export const errorCopy: Record<
  EffectsTimelineErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Enter an account address",
    description:
      "Paste a public Stellar address starting with G to load the effects recorded against it."
  },
  invalid_address: {
    title: "That is not a valid account address",
    description:
      "The value failed Stellar's checksum check. Confirm it starts with G, was copied in full, and is not a secret key — this tool never accepts one."
  },
  account_not_found: {
    title: "This account does not exist on the selected network",
    description:
      "Check the network switch in the header: a testnet account has no history on mainnet, and the reverse is also true."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Wait a moment before loading another page of effects."
  },
  request_failed: {
    title: "Could not load the effects timeline",
    description:
      "Horizon did not return a usable page. Check your connection and try again."
  }
};
