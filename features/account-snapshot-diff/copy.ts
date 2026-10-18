import type {
  ChangeFilter,
  ChangeType,
  SnapshotErrorCode,
  SnapshotSection
} from "@/features/account-snapshot-diff/types";

export const copy = {
  beforeLabel: "Before snapshot JSON",
  beforeHint:
    "Paste a Horizon account resource — the JSON from /accounts/{id}. Everything is compared in your browser; neither snapshot is uploaded or stored.",
  afterLabel: "After snapshot JSON",
  afterHint: "The second observation of the same account, to compare against the first.",
  submit: "Compare snapshots",

  emptyTitle: "Nothing compared yet",
  emptyDescription:
    "Paste two Horizon account snapshots of the same account to see exactly which balances, signers, thresholds and data entries moved.",

  overviewTitle: "Overview",
  changesTitle: "Changes",
  exportTitle: "Export",

  labelAccount: "Account",
  labelChanged: "Changed fields",
  labelUnchanged: "Unchanged fields",

  sectionFilterLabel: "Section",
  changeFilterLabel: "Show",
  filterAllSections: "All sections",
  filterAll: "All fields",
  filterChanged: "Changed only",
  filterUnchanged: "Unchanged only",
  reset: "Reset filters",
  noMatchTitle: "No fields match these filters",
  noMatchDescription:
    "Nothing falls inside both filters at once. Reset them to see the full comparison again.",

  identicalTitle: "These snapshots are identical",
  identicalDescription:
    "Every field this tool compares matches, including balances, signers, thresholds and data entries. Reordered arrays do not count as a difference.",

  labelBefore: "Before",
  labelAfter: "After",
  labelDelta: "Change",

  observationNote:
    "These are two observations, not a history. This tool does not infer what happened between them, does not order them by time — they are labelled before and after because you pasted them that way — and never contacts Horizon.",
  orderNote:
    "Balances are matched by full asset identity, pool shares by pool ID and signers by key, so reordering an array is not a change. Two assets sharing a code but not an issuer are different assets here.",
  absenceNote:
    "An absent field is shown as an em dash and is never treated as zero. A trustline whose limit disappeared is a different event from one whose limit became 0.",
  unsupportedTitle: "Some fields were not compared",
  unsupportedDescription:
    "These top-level fields appear in one of the snapshots but are not part of this comparison. Treat the result as a comparison of the fields listed, not as a complete ledger audit.",

  exportDescription:
    "A deterministic JSON summary of the changes — same pair of snapshots, same bytes, every time. Generated locally; the snapshots themselves are not included or stored.",
  copyExport: "JSON summary",
  copyAccount: "account ID"
} as const;

export const sectionLabels: Record<SnapshotSection, string> = {
  account: "Account",
  balances: "Balances",
  signers: "Signers",
  thresholds: "Thresholds",
  flags: "Flags",
  data: "Data entries"
};

export const changeLabels: Record<ChangeType, string> = {
  added: "Added",
  removed: "Removed",
  changed: "Changed",
  unchanged: "Unchanged"
};

export const changeFilterLabels: Record<ChangeFilter, string> = {
  all: copy.filterAll,
  changed: copy.filterChanged,
  unchanged: copy.filterUnchanged
};

export const errorCopy: Record<SnapshotErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Paste both snapshots first",
    description:
      "This tool compares two Horizon account resources. There is nothing to compare until both are present."
  },
  invalid_input: {
    title: "That input cannot be used",
    description:
      "One of the snapshots contains what looks like a secret key. A Horizon account resource never includes one, so it has been refused and cleared from the field."
  },
  input_too_large: {
    title: "That snapshot is too large",
    description:
      "Each snapshot is capped at roughly 1 MB. An account resource with hundreds of trustlines is still far smaller than that, so anything larger is probably a different document."
  },
  invalid_snapshot: {
    title: "That is not a Horizon account snapshot",
    description:
      "Both inputs must be JSON objects with a valid account_id. Check that you copied the account resource itself rather than a list of accounts, an operations page, or an error response."
  },
  account_mismatch: {
    title: "These snapshots are of different accounts",
    description:
      "Both documents parsed correctly but their account_id fields differ, so comparing them would produce differences that mean nothing. Paste two observations of the same account."
  }
};
