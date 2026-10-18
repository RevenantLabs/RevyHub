import type {
  SignatureGroup,
  SignatureHintAuditorErrorCode
} from "@/features/signature-hint-auditor/types";

export const copy = {
  envelopeLabel: "Transaction envelope XDR",
  envelopeHint:
    "Paste base64 transaction-envelope XDR. Decoding stays in your browser — nothing is sent, stored or signed.",
  signersLabel: "Optional public signer keys",
  signersHint:
    "One or more G… public keys, separated by newlines, commas or spaces. Their four-byte hints are compared to the envelope. Secret seeds (S…) are refused.",
  submit: "Audit signature hints",

  emptyTitle: "No envelope audited yet",
  emptyDescription:
    "Paste a transaction envelope to list every decorated signature hint and optionally match them against public keys you already trust.",

  resultTitle: "Signature hint audit",
  resultDescription:
    "Hints identify candidates only. A match is never treated as a verified signature.",
  disclaimer:
    "Every match below is a hint match, not cryptographic verification. Four-byte hints can collide; provide public keys you already trust and verify signatures separately.",
  memoryNote: "Input stays in memory for this session only and is never persisted or transmitted.",

  groupsTitle: "Decorated signatures",
  candidatesTitle: "Provided public signers",
  noSignatures: "This group carries an empty signature vector.",
  noSignersProvided: "No optional public keys were provided, so every hint is unmatched.",
  noCandidates: "No provided public key shares this hint.",
  oneCandidate: "One hint match — not a verified signature.",
  collisionLabel: "Ambiguous hint — multiple public keys share these four bytes.",
  unmatchedLabel: "No candidate among the keys you provided.",

  labelVariant: "Envelope variant",
  labelSignatureCount: "Decorated signatures",
  labelProvidedSigners: "Public keys compared",
  labelCollisions: "Ambiguous hints",
  labelUnmatched: "Unmatched hints",
  labelHint: "Hint",
  labelIndex: "Index",
  labelGroup: "Group",
  labelCandidates: "Hint-match candidates",
  labelSignerKey: "Public key",
  labelSignerHint: "Derived hint",
  labelMatchKind: "Match",

  groupTransaction: "Transaction signatures",
  groupOuter: "Fee-bump outer signatures",
  groupInner: "Fee-bump inner signatures",

  variantClassicV0: "Classic v0",
  variantClassicV1: "Classic v1",
  variantFeeBump: "Fee bump",

  matchNone: "No candidate",
  matchSingle: "Hint match",
  matchCollision: "Collision",

  collisionNoticeTitle: "Ambiguous and missing hints",
  collisionNoticeBody:
    "When more than one provided public key shares a hint, this tool lists every candidate and refuses to pick a winner. Unmatched hints mean none of the keys you pasted claim that signature."
} as const;

export const groupLabels: Record<SignatureGroup, string> = {
  transaction: copy.groupTransaction,
  fee_bump_outer: copy.groupOuter,
  fee_bump_inner: copy.groupInner
};

export const errorCopy: Record<
  SignatureHintAuditorErrorCode,
  { title: string; description: string }
> = {
  empty_xdr: {
    title: "Paste an envelope first",
    description: "This tool reads base64 transaction-envelope XDR and never leaves your browser."
  },
  invalid_xdr: {
    title: "That is not a usable transaction envelope",
    description:
      "Expect base64 transaction-envelope XDR whose length is a multiple of four. A secret seed is refused and cleared from the field rather than decoded."
  },
  invalid_public_signer: {
    title: "One of the signer keys is not a public key",
    description:
      "Provide ed25519 public keys starting with G. Secret seeds starting with S are refused and cleared — this tool never accepts them."
  },
  unsupported_envelope: {
    title: "This envelope type is not supported",
    description:
      "Only classic v0, classic v1 and fee-bump transaction envelopes can be audited here. Other XDR types are refused."
  },
  too_many_signers: {
    title: "Too many public signer keys",
    description:
      "At most 64 public keys can be compared in one pass. Trim the list to the keys you actually need to check."
  }
};
