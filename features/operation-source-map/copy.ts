import type {
  EnvelopeKind,
  SourceFilter,
  SourceMapErrorCode
} from "@/features/operation-source-map/types";

export const copy = {
  formLabel: "Transaction envelope XDR",
  formHint:
    "Paste base64 envelope XDR. Everything is decoded in your browser — nothing is sent anywhere, and this tool never signs or submits.",
  submit: "Map operation sources",

  emptyTitle: "No envelope mapped yet",
  emptyDescription:
    "Paste a base64 transaction envelope to see which account authorizes each operation, and which operations override the transaction source.",

  overviewTitle: "Overview",
  operationsTitle: "Operations",
  groupsTitle: "Grouped by effective source",
  exportTitle: "Export",

  labelKind: "Envelope kind",
  labelTransactionSource: "Transaction source (inherited default)",
  labelFeePayer: "Fee paid by",
  labelBaseAccount: "Underlying account",
  labelMuxedId: "Muxed ID",
  // Deliberately distinct from the section headings and the per-row badges:
  // a label that reads exactly like a heading makes the page ambiguous to
  // anyone navigating it by text, screen reader included.
  labelOperationCount: "Operation count",
  labelInherited: "Inherited operations",
  labelOverridden: "Overridden operations",

  columnIndex: "#",
  columnType: "Operation",
  columnExplicit: "Explicit source",
  columnEffective: "Effective source",
  columnOrigin: "Origin",

  originInherited: "Inherited",
  originOverridden: "Overridden",
  noExplicitSource: "None declared",

  filterLabel: "Show",
  filterAll: "All operations",
  filterInherited: "Inherited only",
  filterOverridden: "Overridden only",
  reset: "Reset filter",
  noMatchTitle: "No operations match this filter",
  noMatchDescription:
    "Every operation in this envelope falls on the other side of the filter. Reset it to see the full map again.",

  feeBumpNote:
    "In a fee-bump envelope the operations belong to the inner transaction, so the inner source is the inherited default. The fee source pays and is listed separately — it does not authorize any operation, and it never appears in the groups below.",
  scopeNote:
    "An effective source is a structural property of the envelope. This map does not evaluate signatures, signer weights or thresholds, and it does not enumerate Soroban authorization entries, which live inside the operation payload rather than in its source field.",
  muxedNote:
    "Muxed `M…` addresses are kept exactly as the envelope carries them and grouped as themselves. Two `M…` addresses sharing a `G…` account are different sources here, because that is how the protocol treats them.",
  noOperations: "This transaction declares no operations.",

  exportDescription:
    "A deterministic JSON summary of this map — same envelope, same bytes, every time. Generated locally; nothing is uploaded.",
  copyExport: "JSON summary",
  copySource: "source account"
} as const;

export const kindLabels: Record<EnvelopeKind, string> = {
  "classic-v0": "Classic transaction (v0 envelope)",
  "classic-v1": "Classic transaction (v1 envelope)",
  "fee-bump": "Fee-bump transaction"
};

export const filterLabels: Record<SourceFilter, string> = {
  all: copy.filterAll,
  inherited: copy.filterInherited,
  overridden: copy.filterOverridden
};

export const errorCopy: Record<SourceMapErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Paste an envelope first",
    description: "This tool reads base64 transaction-envelope XDR."
  },
  invalid_input: {
    title: "That is not valid base64",
    description:
      "Envelope XDR uses A-Z, a-z, 0-9, + and / with = padding, and its length is a multiple of four. Check for a truncated copy. A secret key is refused outright and cleared from the field rather than left on screen."
  },
  input_too_large: {
    title: "That input is too long",
    description:
      "Envelope XDR is capped at 65,536 characters here. Anything larger is almost certainly not a single transaction envelope."
  },
  invalid_xdr: {
    title: "Valid base64, but not a transaction envelope",
    description:
      "The bytes decoded but are not a well-formed envelope. Make sure you copied transaction-envelope XDR rather than another XDR type such as a ledger entry or a transaction result."
  },
  unsupported_envelope: {
    title: "This envelope variant cannot be mapped",
    description:
      "The envelope decoded but wraps something this tool does not read — for example a fee bump around an inner transaction that is not a v1 envelope. Without a readable inner transaction there is no operations vector to map."
  }
};
