import type {
  DiffErrorCode,
  DiffFilter,
  DiffSection,
  DiffStatus,
  EnvelopeKind
} from "@/features/transaction-envelope-diff/types";

export const copy = {
  leftLabel: "Before envelope XDR",
  leftHint: "The envelope you started with — for example the one you built yourself.",
  rightLabel: "After envelope XDR",
  rightHint: "The envelope to check against it — for example the one a wallet handed back.",
  networkLabel: "Network passphrase",
  networkHint:
    "Used to decode both envelopes with the SDK. Pick the network they were built for.",
  customNetworkLabel: "Custom network passphrase",
  customNetworkHint: "Used verbatim when decoding both sides.",
  customOption: "Custom passphrase…",
  submit: "Compare envelopes",

  emptyTitle: "Nothing compared yet",
  emptyDescription:
    "Paste two base64 transaction envelopes to see exactly which fields differ, instead of comparing two opaque strings by eye.",

  overviewTitle: "Overview",
  changesTitle: "Fields",
  exportTitle: "Export",

  labelLeftKind: "Before envelope kind",
  labelRightKind: "After envelope kind",
  labelChanged: "Changed fields",
  labelUnchanged: "Unchanged fields",
  labelPassphrase: "Passphrase used",

  columnPath: "Field",
  columnBefore: "Before",
  columnAfter: "After",

  filterLabel: "Show",
  filterAll: "All fields",
  filterChanged: "Changed only",
  filterUnchanged: "Unchanged only",
  reset: "Reset filter",
  noMatchTitle: "No fields match this filter",
  noMatchDescription:
    "Every field falls on the other side of the filter. Reset it to see the full comparison again.",

  identicalTitle: "These envelopes are identical",
  identicalDescription:
    "Every field matches, signatures included. Any difference in the two strings you pasted was whitespace or line wrapping, which is stripped before decoding.",
  signaturesOnlyTitle: "Only the signatures differ",
  signaturesOnlyDescription:
    "The transaction body and its operations are byte-for-byte the same; what changed is who signed it, or how many did. That is usually the expected outcome of sending an envelope away to be signed.",
  kindChangedTitle: "These are different kinds of envelope",
  kindChangedDescription:
    "The two sides are not the same shape, so most fields will appear as added or removed rather than changed. Comparing a fee bump against the transaction it wraps is the usual reason.",

  orderNote:
    "Operations are compared by position. A reordering is a change, because the ledger applies them in order and the same operations in a different order do different things.",
  unknownFieldNote:
    "Each operation also carries its canonical XDR as a field. A difference this tool does not model by name still shows up there rather than being silently dropped.",
  signatureSectionNote:
    "Signature changes are listed in their own section, away from the transaction body, so a re-signed envelope is never mistaken for an altered one.",
  layerNote:
    "For a fee-bump envelope the wrapper and the transaction it wraps are kept on separate paths, `outer.` and `inner.`, so a change to one is never reported against the other.",

  exportDescription:
    "A deterministic JSON summary of the changes — same pair of envelopes, same bytes, every time. Generated locally; nothing is uploaded.",
  copyExport: "JSON summary"
} as const;

export const sectionLabels: Record<DiffSection, string> = {
  envelope: "Envelope",
  body: "Transaction body",
  operations: "Operations",
  signatures: "Signatures"
};

export const statusLabels: Record<DiffStatus, string> = {
  unchanged: "Unchanged",
  changed: "Changed",
  added: "Added",
  removed: "Removed"
};

export const kindLabels: Record<EnvelopeKind, string> = {
  "classic-v0": "Classic transaction (v0 envelope)",
  "classic-v1": "Classic transaction (v1 envelope)",
  "fee-bump": "Fee-bump transaction"
};

export const filterLabels: Record<DiffFilter, string> = {
  all: copy.filterAll,
  changed: copy.filterChanged,
  unchanged: copy.filterUnchanged
};

export const errorCopy: Record<DiffErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Both envelopes and a passphrase are needed",
    description:
      "Fill in the before envelope, the after envelope and the network passphrase. There is nothing to compare until all three are present."
  },
  invalid_input: {
    title: "That input cannot be used",
    description:
      "One of the fields does not hold base64 envelope XDR. A secret key is refused outright and cleared from the field."
  },
  input_too_large: {
    title: "That input is too long",
    description:
      "Each envelope is capped at 65,536 characters and the passphrase at 256. Anything larger is almost certainly not a single transaction envelope."
  },
  invalid_left_xdr: {
    title: "The before envelope could not be read",
    description:
      "It is not valid base64 envelope XDR, or it decoded to something that is not a transaction envelope. The after envelope has not been checked yet — fix this one first."
  },
  invalid_right_xdr: {
    title: "The after envelope could not be read",
    description:
      "The before envelope decoded fine, so the problem is on this side: check for a truncated copy, or for XDR of another type such as a transaction result."
  }
};
