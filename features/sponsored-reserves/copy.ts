import type {
  SponsoredEntryKind,
  SponsoredReservesErrorCode
} from "@/features/sponsored-reserves/types";

export const copy = {
  formLabel: "Account address",
  formHint:
    "Paste a public Stellar account address starting with G. Sponsorship data is read only.",
  formPlaceholder: "GABC...XYZ",
  submit: "Inspect sponsored reserves",
  loading: "Loading sponsorship relationships...",
  emptyTitle: "No account inspected yet",
  emptyDescription:
    "Paste an account address to see which of its entries another account funds and how many reserves it funds for others.",
  resultTitle: "Sponsorship summary",
  sponsoredForLabel: "Sponsored for this account",
  sponsoredForDescription: "Reserve units paid by other accounts.",
  sponsoringLabel: "Sponsored by this account",
  sponsoringDescription: "Reserve units this account pays for on other accounts.",
  netEffectLabel: "Net reserve effect",
  netReliefDescription: "This amount is removed from the account's minimum-balance requirement.",
  netBurdenDescription: "This amount is added to the account's minimum-balance requirement.",
  netNeutralDescription: "Sponsorship does not change this account's minimum-balance requirement.",
  xlmUnit: "XLM",
  noRelationshipsTitle: "This account has no sponsorship relationships",
  noRelationshipsDescription:
    "Horizon reports no reserves sponsored for this account and no reserves it sponsors for others.",
  noSponsoredEntriesTitle: "No entries are sponsored for this account",
  noSponsoredEntriesDescription:
    "This account sponsors reserves for others, but none of its own entries, trustlines, signers, offers or data entries are sponsored.",
  entriesTitle: "Entries sponsored for this account",
  entriesNote:
    "A sponsored account entry moves two reserve units; every other entry moves one.",
  columnKind: "Kind",
  columnEntry: "Entry",
  columnSponsor: "Sponsoring account",
  entryKinds: {
    account: "Account entry",
    trustline: "Trustline",
    signer: "Signer",
    offer: "Offer",
    data: "Data entry"
  } satisfies Record<SponsoredEntryKind, string>,
  reserveUnits: (count: number) => `${count} reserve unit${count === 1 ? "" : "s"}`,
  entriesCaption: (accountId: string) => `Ledger entries sponsored for account ${accountId}`,
  sponsorCopyLabel: (reference: string) => `sponsor for ${reference}`
} as const;

export const errorCopy: Record<
  SponsoredReservesErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Enter an account address",
    description: "Paste a public Stellar address starting with G to inspect its reserves."
  },
  invalid_address: {
    title: "That is not a valid account address",
    description:
      "The value failed Stellar's checksum check. Confirm it starts with G and was copied in full."
  },
  account_not_found: {
    title: "This account does not exist on the selected network",
    description:
      "Check the network switch in the header and confirm the account has been funded on that network."
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Wait a moment, then inspect the account again."
  },
  request_failed: {
    title: "Could not load sponsorship data",
    description: "Check your connection and try again."
  }
};
