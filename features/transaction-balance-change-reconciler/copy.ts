import type {
  IncompleteEvidenceReason,
  MetaVariant,
  TransactionBalanceChangeReconcilerErrorCode
} from "@/features/transaction-balance-change-reconciler/types";

export const copy = {
  envelopeLabel: "Transaction envelope XDR",
  envelopeHint: "The signed envelope that was submitted — classic or fee-bump.",
  resultLabel: "Transaction result XDR",
  resultHint: "Supplies the fee charged. Without it the native residual cannot be checked.",
  metaLabel: "Transaction metadata XDR",
  metaHint: "Before/after ledger-entry changes for the transaction.",
  networkLabel: "Network passphrase",
  networkHint: "Used only to decode the envelope. Nothing is fetched.",
  customNetworkLabel: "Custom network passphrase",
  customNetworkHint: "Used verbatim when decoding the envelope.",
  customOption: "Custom passphrase…",
  submit: "Reconcile balances",

  emptyTitle: "Nothing reconciled yet",
  emptyDescription:
    "Paste a transaction envelope, its result and its metadata to see per-account balance deltas and any unexplained residual — computed locally from the XDR alone.",

  overviewTitle: "Overview",
  deltasTitle: "Balance deltas",
  residualsTitle: "Residuals",
  evidenceTitle: "Evidence",

  labelMetaVariant: "Metadata variant",
  labelFeeCharged: "Fee charged",
  labelFeeSource: "Fee source",
  labelSponsored: "Fee sponsorship",
  labelReconciled: "Fully reconciled",
  labelDeltaCount: "Account/asset deltas",

  sponsoredYes: "Yes — fee source differs from the transaction source",
  sponsoredNo: "No — the transaction source paid the fee",
  reconciledYes: "Yes",
  reconciledNo: "No — see residuals",

  columnAccount: "Account",
  columnAsset: "Asset",
  columnBefore: "Before",
  columnAfter: "After",
  columnDelta: "Delta",

  residualAsset: "Asset",
  residualSummed: "Summed delta",
  residualExpected: "Expected sum",
  residualValue: "Residual",
  residualStatus: "Status",
  residualOk: "Reconciled",
  residualOpen: "Unexplained",

  incompleteTitle: "Evidence is incomplete",
  incompleteDescription:
    "The report below is still shown, but at least one residual or unpaired change could not be closed from the pasted XDR alone.",

  successTitle: "Balances reconcile",
  successDescription:
    "Every observed account/asset delta matches the conservation expectation after accounting for the fee charged. Nothing unexplained remains.",

  loadingLabel: "Reconciling locally…",

  evidenceEnvelope: "Envelope",
  evidenceResult: "Result",
  evidenceMeta: "Metadata",
  evidencePresent: "Present",
  evidenceBalanceEntries: "Balance entry pairs",
  evidenceSkipped: "Non-balance entries skipped",
  evidenceReasons: "Incomplete reasons",

  noDeltasTitle: "No balance deltas",
  noDeltasDescription:
    "The metadata decoded, but no account or trustline balance changes were present. Non-balance ledger entries are skipped on purpose."
} as const;

export const metaVariantLabels: Record<MetaVariant, string> = {
  operations: "TransactionMeta (operations / v0)",
  v1: "TransactionMetaV1",
  v2: "TransactionMetaV2",
  v3: "TransactionMetaV3"
};

export const incompleteReasonCopy: Record<IncompleteEvidenceReason, string> = {
  missing_fee_evidence:
    "Native residual needs the fee charged from the result XDR, which was not available.",
  unexplained_residual:
    "The summed account deltas for an asset do not match the conservation expectation after fees.",
  unpaired_change:
    "A ledger key was touched without a usable before/after balance pair.",
  skipped_non_balance:
    "Some ledger entries were not account or issued-asset trustline balances and were skipped."
};

export const errorCopy: Record<
  TransactionBalanceChangeReconcilerErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Envelope, result, metadata and passphrase are needed",
    description:
      "Fill in all four fields. The reconciler needs the envelope for the fee source, the result for the fee charged, and the metadata for before/after balances."
  },
  invalid_input: {
    title: "That input cannot be used",
    description:
      "A secret key is refused outright and cleared from the field. Paste base64 transaction XDR only."
  },
  malformed_data: {
    title: "The XDR could not be decoded",
    description:
      "One of the blobs is not valid base64 of the expected type. Check you pasted envelope, result and metadata — not a mix of the three."
  },
  unsupported_variant: {
    title: "That protocol variant is not supported",
    description:
      "The installed SDK exposes TransactionMeta operations/v1/v2/v3 and classic or fee-bump envelopes. Anything else is rejected rather than guessed."
  },
  too_large: {
    title: "That input is too long",
    description:
      "Each XDR blob is capped at 65,536 characters and the passphrase at 256. Anything larger is almost certainly not a single transaction."
  }
};
