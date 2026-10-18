import type { TransactionFeeChargeAuditErrorCode } from "@/features/transaction-fee-charge-audit/types";

export const copy = {
  formLabel: "Transaction hash",
  formHint:
    "64 hexadecimal characters. This tool reads a settled transaction — it never forecasts inclusion fees.",
  submit: "Audit fees",
  loading: "Auditing fees…",
  emptyTitle: "No fee charge audited yet",
  emptyDescription:
    "Paste a settled transaction hash to compare the maximum fee offered with the fee Horizon actually charged.",

  resultTitle: "Fee charge audit",
  historicalNote:
    "A fee charged for one settled transaction is historical evidence. It is not a forecast of what the next inclusion will cost.",

  feeBreakdownTitle: "Offered versus charged",
  feeBreakdownDescription:
    "Maximum fee is the bid recorded on the envelope. Fee charged is what the ledger took. The difference is exact and in stroops.",

  envelopeTitle: "Envelope",
  envelopeClassicDescription:
    "A classic envelope has a single fee layer — the source account offered the maximum and paid the charge.",
  envelopeFeeBumpDescription:
    "A fee-bump envelope separates the outer fee source (who paid) from the inner transaction source (whose operations ran).",

  ledgerTitle: "Ledger and network",
  ledgerDescription: "The ledger that included this transaction and the network the lookup used.",

  labelHash: "Transaction hash",
  labelEnvelopeKind: "Envelope type",
  labelMaxFee: "Maximum fee offered",
  labelFeeCharged: "Fee charged",
  labelDifference: "Unused fee (offered − charged)",
  labelOperationCount: "Operation count",
  labelSourceAccount: "Source account",
  labelOuterFeeSource: "Outer fee source",
  labelInnerSource: "Inner source account",
  labelInnerFee: "Inner fee bid",
  labelLedger: "Ledger",
  labelClosedAt: "Ledger closed at",
  labelBaseFee: "Ledger base fee",
  labelNetwork: "Network",

  copyHash: "transaction hash",
  copySource: "source account",
  copyOuterFeeSource: "outer fee source",
  copyInnerSource: "inner source account"
} as const;

export const errorCopy: Record<
  TransactionFeeChargeAuditErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Enter a transaction hash",
    description: "Paste the 64-character hash of the settled transaction you want to audit."
  },
  invalid_hash: {
    title: "That is not a transaction hash",
    description:
      "Transaction hashes are exactly 64 hexadecimal characters (0-9 and a-f). Account addresses start with G and belong in another tool."
  },
  transaction_not_found: {
    title: "No transaction with this hash on the selected network",
    description:
      "Check the network switch in the header — a testnet hash does not exist on mainnet, and the reverse is also true."
  },
  ledger_not_found: {
    title: "The referenced ledger is missing",
    description:
      "Horizon returned the transaction but not the ledger it names. Try again later or confirm the network is fully synced."
  },
  invalid_fee_data: {
    title: "Fee fields are incomplete — audit cannot finish",
    description:
      "Maximum fee or fee charged is absent or malformed on this record, so the offered-versus-charged difference cannot be computed exactly. This is an incomplete audit, not a fee forecast."
  },
  unsupported_envelope: {
    title: "This envelope type is not supported",
    description:
      "The tool audits classic and fee-bump envelopes only. Re-check that you pasted a settled transaction hash rather than another XDR type."
  },
  request_failed: {
    title: "Could not reach Horizon",
    description: "The request did not complete. Check your connection and try again."
  }
};
