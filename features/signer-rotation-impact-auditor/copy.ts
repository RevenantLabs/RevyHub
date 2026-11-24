import type {
  RotationChangeKind,
  SignerRotationErrorCode,
  ThresholdLevel
} from "@/features/signer-rotation-impact-auditor/types";

export const copy = {
  snapshotLabel: "Horizon account JSON",
  snapshotHint:
    "Paste the public Horizon /accounts/{id} resource for the account whose signers you are rotating.",
  envelopeLabel: "Set-options envelope XDR",
  envelopeHint:
    "A base64 transaction envelope whose set_options operations propose the rotation. Nothing is submitted.",
  networkLabel: "Network passphrase",
  networkHint: "Used only to decode the envelope with the SDK. Pick the network it was built for.",
  customNetworkLabel: "Custom network passphrase",
  customNetworkHint: "Used verbatim when decoding the envelope.",
  customOption: "Custom passphrase…",
  submit: "Audit rotation impact",

  emptyTitle: "No rotation audited yet",
  emptyDescription:
    "Paste a Horizon account snapshot and a set-options envelope to see which authorization thresholds stay reachable after each step.",

  overviewTitle: "Overview",
  timelineTitle: "Rotation timeline",
  lockoutTitle: "Lockout evidence",
  evidenceTitle: "Evidence coverage",
  exportTitle: "Export",

  labelAccount: "Account",
  labelEnvelopeKind: "Envelope kind",
  labelInitialWeight: "Initial total weight",
  labelFinalWeight: "Final total weight",
  labelSteps: "Set-options steps applied",
  labelPassphrase: "Passphrase used",

  incompleteTitle: "Evidence is incomplete",
  incompleteDescription:
    "The snapshot is missing signer or threshold fields this audit needs. Reachability claims that depend on missing evidence are marked unavailable rather than guessed.",

  intermediateLockoutTitle: "An intermediate step locks the account",
  intermediateLockoutDescription:
    "At least one threshold becomes unreachable mid-rotation. Check the first locking operation below — later steps may or may not recover.",
  finalLockoutTitle: "The final state is locked",
  finalLockoutDescription:
    "After every operation in the envelope, at least one authorization threshold cannot be met with the remaining signer weight.",
  recoveredTitle: "Final state recovers from an intermediate lockout",
  recoveredDescription:
    "A middle step left a threshold unreachable, but later operations restored enough weight. The intermediate lockout is still reported so it is never mistaken for a safe path.",
  noLockoutTitle: "No lockout detected",
  noLockoutDescription:
    "Every threshold that has evidence stays reachable after each applied step, including the final state.",

  firstLockingLabel: "First locking operation",
  lockedLevelsLabel: "Unreachable thresholds (final)",
  shortfallLabel: "Shortfall",
  requiredLabel: "Required",
  availableLabel: "Available",
  reachableLabel: "Reachable",
  unavailable: "Unavailable",
  yes: "Yes",
  no: "No",

  stepApplies: "Applies to snapshot account",
  stepSkipped: "Different source — not applied",
  inheritedSource: "Inherited transaction source",
  explicitSource: "Explicit operation source",

  evidenceSigners: "Signers present",
  evidenceThresholds: "Thresholds present",
  evidenceSetOptions: "Set-options operations present",

  advisoryNote:
    "This is a snapshot-based advisory report. It does not simulate signatures, does not submit the envelope, and cannot guarantee that a listed signer can actually produce a signature.",

  exportDescription:
    "A deterministic JSON summary of the audit — same inputs, same bytes. Generated locally; nothing is uploaded.",
  copyExport: "JSON summary",

  loadingLabel: "Auditing rotation locally…"
} as const;

export const thresholdLabels: Record<ThresholdLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High"
};

export const changeLabels: Record<RotationChangeKind, string> = {
  master_weight: "Master weight",
  threshold_low: "Low threshold",
  threshold_medium: "Medium threshold",
  threshold_high: "High threshold",
  signer_set: "Signer weight set",
  signer_remove: "Signer removed (weight 0)",
  ignored_operation: "Non set-options operation"
};

export const errorCopy: Record<
  SignerRotationErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Account JSON, envelope and passphrase are needed",
    description:
      "Fill in the Horizon account snapshot, the set-options envelope XDR and the network passphrase. There is nothing to audit until all three are present."
  },
  invalid_input: {
    title: "That input cannot be used",
    description:
      "A secret key was detected and refused. Only public Horizon account JSON and transaction envelope XDR are accepted, and the field is cleared."
  },
  malformed_data: {
    title: "The account JSON or envelope could not be read",
    description:
      "The snapshot is not a Horizon account resource, or the envelope is not valid base64 transaction XDR. Fix the paste before auditing again."
  },
  unsupported_variant: {
    title: "That envelope shape is not supported",
    description:
      "Only classic v0/v1 and fee-bump envelopes whose inner transaction carries set_options operations are audited. Another XDR type cannot be evaluated here."
  },
  too_large: {
    title: "That input is too long",
    description:
      "The account snapshot is capped at 1,048,576 characters, the envelope at 65,536 and the passphrase at 256. Anything larger is almost certainly not a single account or transaction."
  }
};
