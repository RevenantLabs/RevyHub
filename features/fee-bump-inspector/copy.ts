import type { FeeBumpErrorCode } from "@/features/fee-bump-inspector/types";

export const copy = {
  envelopeLabel: "Fee-bump envelope XDR",
  envelopeHint:
    "Paste base64 envelope XDR. Everything is decoded in your browser — nothing is sent anywhere, and this tool never signs or submits.",
  networkLabel: "Network passphrase",
  networkHint:
    "A transaction hash is derived from the network passphrase, so the same envelope hashes differently on each network. Pick the network the envelope was built for.",
  customNetworkLabel: "Custom network passphrase",
  customNetworkHint: "Used verbatim as the passphrase when deriving both hashes.",
  customOption: "Custom passphrase…",
  submit: "Inspect fee bump",

  emptyTitle: "No fee-bump envelope inspected yet",
  emptyDescription:
    "Paste a base64 fee-bump envelope to read the outer wrapper and the inner transaction as two separate layers.",

  outerTitle: "Outer layer — the fee bump",
  outerDescription:
    "The wrapper. Its fee source pays, and its signatures are made over the outer hash below.",
  innerTitle: "Inner layer — the transaction that executes",
  innerDescription:
    "The original transaction. Its own source, sequence and operations are what actually run, and its signatures are made over the inner hash.",
  feeBidTitle: "Fee bid",
  operationsTitle: "Inner operations",
  networkTitle: "Network",

  labelFeeSource: "Fee paid by",
  labelBaseAccount: "Underlying account",
  labelMuxedId: "Muxed ID",
  labelMaxFee: "Maximum total fee",
  labelOuterHash: "Outer transaction hash",
  labelOuterSignatures: "Outer signatures",
  labelInnerSource: "Inner source account",
  labelInnerSequence: "Sequence number",
  labelInnerFee: "Inner fee bid",
  labelOperationCount: "Operation count",
  labelInnerHash: "Inner transaction hash",
  labelInnerSignatures: "Inner signatures",
  labelChargeableOperations: "Operations charged",
  labelMaxFeePerOperation: "Maximum fee per operation",
  labelPassphrase: "Passphrase used",
  labelSignatureHints: "Signature hints",

  copyOuterHash: "outer transaction hash",
  copyInnerHash: "inner transaction hash",

  feeBidExplainer:
    "The outer amount is a bid, not a charge. A fee bump is charged for every inner operation plus one for the wrapper itself, at the network's inclusion fee for that ledger — which is decided when the transaction is included and cannot be read from an unsigned envelope. The inner fee bid no longer pays for anything once the transaction is wrapped.",
  signatureNote:
    "Signatures are counted per layer and identified only by their four-byte hints. This tool does not verify them and does not evaluate whether either account's signing thresholds are met.",
  hashNote:
    "Each copy action returns the hash of the layer it sits in. The outer hash is what the fee source signs; the inner hash is what the inner transaction's signers signed, and it is unchanged by the wrapper.",
  noSignatures: "None — this layer carries an empty signature vector.",
  noOperations: "This inner transaction declares no operations."
} as const;

export const errorCopy: Record<FeeBumpErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Paste an envelope first",
    description: "This tool reads base64 fee-bump transaction-envelope XDR."
  },
  invalid_input: {
    title: "That is not valid base64",
    description:
      "Envelope XDR uses A-Z, a-z, 0-9, + and / with = padding, and its length is a multiple of four. Check for a truncated copy. A secret key is refused outright and cleared from the field rather than left on screen."
  },
  input_too_large: {
    title: "That input is too long",
    description:
      "Envelope XDR is capped at 65,536 characters and the passphrase at 256. Anything larger is almost certainly not a single envelope."
  },
  not_fee_bump: {
    title: "This is an ordinary transaction, not a fee bump",
    description:
      "The envelope decoded correctly but has a single layer, so there is no separate fee payer to report. Use the Transaction XDR Inspector for ordinary envelopes, or wrap this one in a fee bump first."
  },
  invalid_xdr: {
    title: "Valid base64, but not a transaction envelope",
    description:
      "The bytes decoded but are not a well-formed envelope. Make sure you copied transaction-envelope XDR rather than another XDR type such as a ledger entry or a transaction result."
  },
  empty_passphrase: {
    title: "Choose a network passphrase",
    description:
      "Both transaction hashes are derived from the passphrase, so neither can be computed without it. Pick a standard network or enter the passphrase the envelope was built for."
  }
};
