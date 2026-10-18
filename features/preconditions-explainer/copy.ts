import type {
  BoundStatus,
  EnvelopeVariant,
  ExtraSignerKind,
  PreconditionsErrorCode,
  Verdict
} from "@/features/preconditions-explainer/types";

export const copy = {
  formLabel: "Transaction envelope XDR",
  formHint:
    "Paste base64 envelope XDR. It is decoded in your browser; only the current ledger is fetched from Horizon. This tool never signs or submits, and never accepts a secret key.",
  submit: "Explain preconditions",
  loading: "Reading the current ledger...",

  emptyTitle: "No transaction explained yet",
  emptyDescription:
    "Paste a transaction envelope to see its time bounds, ledger bounds, minimum sequence rules and extra signers, checked against the current ledger.",

  transactionTitle: "Transaction",
  labelVariant: "Envelope type",
  labelSource: "Source account",
  labelSequence: "Sequence number",

  snapshotTitle: "Snapshot",
  labelCurrentLedger: "Current ledger",
  labelLedgerClosedAt: "Ledger closed at",
  labelEvaluatedAt: "Answer taken at",
  labelClock: "Compared against",
  clockLedger: "The close time of the newest closed ledger",
  clockLocal: "Your device clock, because no ledger could be fetched",
  snapshotNote:
    "Preconditions are evaluated against the ledger that will contain the transaction, so this answer is a snapshot. Re-run it before relying on a borderline result.",

  timeBoundsTitle: "Time bounds",
  labelValidFrom: "Valid from",
  labelValidUntil: "Valid until",
  noTimeBounds:
    "This transaction declares no time bounds, so nothing about the clock can stop it being included.",
  timeBoundsNote:
    "Time bounds are compared against the close time of the ledger the transaction lands in, not against your device clock, so a result within a few seconds of a bound can still go either way.",

  ledgerBoundsTitle: "Ledger bounds",
  labelMinLedger: "Valid from ledger",
  labelMaxLedger: "Invalid from ledger",
  noLedgerBounds: "This transaction declares no ledger bounds.",
  ledgerBoundsNote:
    "minLedger is inclusive and maxLedger is exclusive: the transaction becomes invalid on the maxLedger ledger itself, not after it.",
  ledgerBoundsUnknown:
    "The current ledger could not be fetched, so these bounds are shown as declared but not compared against anything.",

  sequenceRulesTitle: "Sequence rules",
  labelMinSequenceNumber: "Minimum sequence number",
  labelMinSequenceAge: "Minimum sequence age",
  labelMinSequenceLedgerGap: "Minimum sequence ledger gap",
  minSequenceNumberGate:
    "Gates on the source account's current sequence number: instead of requiring it to be exactly one below this transaction's, it only has to be at least this value. That is what lets a pre-signed transaction stay usable after other transactions have moved the account on.",
  minSequenceAgeGate:
    "Gates on how long ago the source account's sequence number last changed. The account must have been idle for at least this long, which is how a recovery or claim transaction is held back until the account owner has clearly stopped using it.",
  minSequenceLedgerGapGate:
    "Gates on how many ledgers ago the source account's sequence number last changed. It is the ledger-count equivalent of the minimum sequence age, and it is unaffected by how fast ledgers happen to be closing.",
  sequenceRulesNote:
    "These three are settled by reading the source account, not by reading this envelope, so they are explained here rather than judged. The verdict above covers only the bounds that the envelope and the current ledger can settle on their own.",

  extraSignersTitle: "Extra signers",
  extraSignersNote:
    "Every key listed here must also sign, on top of whatever the source account's signing thresholds already require. An extra signer does not replace those thresholds; it is added to them.",
  noExtraSigners: "This transaction requires no extra signers.",

  accountDependentBadge: "Needs the source account",
  reset: "Explain another transaction",

  degradedTitle: "Answered without the current ledger",
  degradedDescription:
    "The bounds below were decoded from the envelope, but nothing could be compared against the chain. Time bounds fall back to your device clock, and ledger bounds are left unevaluated."
} as const;

export const verdictCopy: Record<Verdict, { title: string; description: string }> = {
  satisfiable: {
    title: "The bounds on this transaction are satisfiable right now",
    description:
      "Every bound the envelope declares is open at this ledger. Whether it actually succeeds still depends on the source account's sequence number, its signers and its balance."
  },
  not_yet: {
    title: "This transaction is not valid yet",
    description:
      "A lower bound has not been reached. Submitting now returns txTOO_EARLY; the same envelope becomes valid once the bound below is passed."
  },
  expired: {
    title: "This transaction can no longer be included",
    description:
      "An upper bound has already passed. Submitting returns txTOO_LATE, and no amount of waiting or re-signing helps — a new transaction has to be built."
  },
  unknown: {
    title: "The bounds could not be fully checked",
    description:
      "The envelope declares ledger bounds, but the current ledger could not be fetched, so there is nothing to compare them against."
  }
};

export const boundStatusCopy: Record<BoundStatus, string> = {
  satisfied: "Open now",
  not_yet: "Not reached yet",
  expired: "Already passed",
  unknown: "Not checked"
};

export const variantCopy: Record<EnvelopeVariant, string> = {
  "classic-v0": "Classic v0 envelope",
  "classic-v1": "Classic v1 envelope",
  "fee-bump": "Fee bump — the preconditions below belong to the inner transaction"
};

export const signerKindCopy: Record<ExtraSignerKind, string> = {
  ed25519: "Account signature (ed25519)",
  "pre-auth-tx": "Pre-authorised transaction hash",
  "hash-x": "Hash(x) preimage",
  "ed25519-signed-payload": "Signed payload (ed25519)"
};

export const errorCopy: Record<PreconditionsErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Paste an envelope first",
    description:
      "This tool reads base64 transaction-envelope XDR — the same string a wallet shows you before you sign."
  },
  invalid_xdr: {
    title: "That did not decode to a transaction envelope",
    description:
      "Envelope XDR is base64 whose length is a multiple of four, and it decodes to a transaction envelope rather than to another XDR type such as a transaction result. Check for a truncated copy, and never paste a secret key here — this tool rejects one outright."
  },
  no_preconditions: {
    title: "This transaction declares no preconditions, so it is valid indefinitely",
    description:
      "There is no window to miss: it can be included in any ledger, at any time, for as long as its sequence number is still the next one for the source account. That also means a signed copy of this envelope never stops being submittable, so anyone who obtains it can submit it later — add time bounds if that matters."
  },
  ledger_unavailable: {
    title: "The current ledger could not be fetched",
    description:
      "Horizon answered, but not with a usable ledger. Check the network switch in the header and try again; the bounds decoded from the envelope are still shown."
  },
  request_failed: {
    title: "Could not reach Horizon",
    description:
      "The ledger request timed out or failed in transit. Check your connection and try again; the bounds decoded from the envelope are still shown."
  }
};
