import type { FeeBumpReplacementComparatorErrorCode } from "@/features/fee-bump-replacement-comparator/types";

export const copy = {
  leftLabel: "Current fee-bump envelope XDR",
  leftHint:
    "The fee-bump envelope you already have — for example the lower-fee wrapper waiting in the mempool.",
  rightLabel: "Replacement fee-bump envelope XDR",
  rightHint:
    "The candidate replacement — usually a higher outer fee wrapping the same inner transaction.",
  networkLabel: "Network passphrase",
  networkHint:
    "Inner transaction hashes are derived from this passphrase. Pick the network both envelopes were built for.",
  customNetworkLabel: "Custom network passphrase",
  customNetworkHint: "Used verbatim when hashing both inner transactions.",
  customOption: "Custom passphrase…",
  submit: "Compare fee bumps",

  emptyTitle: "No fee-bump pair compared yet",
  emptyDescription:
    "Paste two fee-bump envelopes that should wrap the same inner transaction. This tool checks whether only the outer fee terms differ.",

  overviewTitle: "Comparison overview",
  innerIdentityTitle: "Inner identity",
  outerFeeTitle: "Outer fee terms",
  sideBySideTitle: "Side-by-side summary",
  networkTitle: "Network",

  labelPassphrase: "Passphrase used",
  labelLeftOuterFee: "Current outer fee",
  labelRightOuterFee: "Replacement outer fee",
  labelFeeDelta: "Outer fee delta",
  labelLeftFeeSource: "Current fee source",
  labelRightFeeSource: "Replacement fee source",
  labelLeftOuterSignatures: "Current outer signatures",
  labelRightOuterSignatures: "Replacement outer signatures",
  labelLeftInnerOps: "Current inner operations",
  labelRightInnerOps: "Replacement inner operations",
  labelLeftInnerHash: "Current inner hash",
  labelRightInnerHash: "Replacement inner hash",
  labelLeftInnerSource: "Current inner source",
  labelRightInnerSource: "Replacement inner source",
  labelLeftInnerSequence: "Current inner sequence",
  labelRightInnerSequence: "Replacement inner sequence",
  labelLeftInnerSignatures: "Current inner signatures",
  labelRightInnerSignatures: "Replacement inner signatures",
  labelHashesMatch: "Inner hashes match",
  labelPayloadsMatch: "Inner payloads match",
  labelVerdict: "Inner identity verdict",
  labelReplacement: "Replacement candidate",

  yes: "Yes",
  no: "No",

  equivalentTitle: "Same inner transaction",
  equivalentDescription:
    "Both network-aware inner hashes and the signature-free payloads match under the selected passphrase. Outer fee terms may still differ.",
  refusedTitle: "Equivalent-inner verdict refused",
  refusedDescription:
    "The inner payload or the network-aware hash differs. This tool will not call these fee bumps a replacement pair.",
  incompleteEvidenceTitle: "Incomplete evidence for equivalence",
  incompleteEvidenceDescription:
    "A replacement claim needs both matching inner hashes and matching signature-free payloads. One of those checks failed, so the equivalent-inner verdict is refused.",

  feeIncreasedNote: "The replacement bids a higher outer fee.",
  feeDecreasedNote:
    "The replacement bids a lower outer fee. That is shown exactly; this tool does not predict mempool acceptance.",
  feeUnchangedNote: "Both wrappers bid the same outer fee.",
  feeSourceChangedNote: "The fee-source accounts differ between the two wrappers.",
  feeSourceSameNote: "Both wrappers use the same fee-source account.",

  identityNote:
    "Inner signatures are counted but not part of the identity check: two wrappers around the same body with different inner signatures still count as equivalent when the hashes and signature-free payloads match.",
  hashNote:
    "Each inner hash is computed with the selected network passphrase. Changing the passphrase changes both hashes; equivalence is never asserted from payload alone.",
  noSubmitNote:
    "This tool never signs, submits, or predicts whether a replacement will be accepted by the network."
} as const;

export const errorCopy: Record<
  FeeBumpReplacementComparatorErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Both envelopes and a passphrase are needed",
    description:
      "Fill in the current fee-bump envelope, the replacement envelope and the network passphrase. There is nothing to compare until all three are present."
  },
  invalid_input: {
    title: "That input cannot be used",
    description:
      "Each field must hold base64 fee-bump envelope XDR. A secret key is refused outright and cleared from the field."
  },
  too_large: {
    title: "That input is too long",
    description:
      "Each envelope is capped at 65,536 characters and the passphrase at 256. Anything larger is almost certainly not a single fee-bump envelope."
  },
  malformed_data: {
    title: "Valid base64, but not a fee-bump envelope",
    description:
      "The bytes decoded but are not a well-formed fee-bump transaction envelope. Check for a truncated copy, or for XDR of another type such as a transaction result."
  },
  unsupported_variant: {
    title: "This is an ordinary transaction, not a fee bump",
    description:
      "One side decoded correctly but has a single layer, so there is no outer fee source to compare. Wrap it in a fee bump first, or use the Fee-Bump Envelope Inspector on a single envelope."
  }
};
