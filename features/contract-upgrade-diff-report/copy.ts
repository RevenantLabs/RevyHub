import type {
  ChangeImpact,
  ChangeStatus,
  DeclarationKind,
  EvidenceStatus,
  MetadataSection,
  UnknownReason,
  UpgradeErrorCode,
  UpgradeSide
} from "@/features/contract-upgrade-diff-report/types";

export const copy = {
  oldLabel: "Current (old) Wasm",
  oldHint: "The contract binary that is deployed today. Up to 1 MiB; it is read locally and never executed.",
  newLabel: "Upgrade (new) Wasm",
  newHint: "The binary you intend to upgrade to. Up to 1 MiB; it is read locally and never executed.",
  submit: "Compare Wasm files",
  working: "Reading locally…",
  reset: "Clear",

  emptyTitle: "No binaries compared yet",
  emptyDescription:
    "Choose the current and the upgrade Wasm. Both are decoded in this browser: their code hashes, contract specification, environment version and publisher metadata are compared, and nothing is uploaded or run.",

  loadingTitle: "Processing locally",
  loadingDescription: "Reading both files and decoding their custom sections in this browser. Nothing is sent anywhere.",

  overviewTitle: "Overview",
  disclaimer:
    "This is a declared-interface report. It compares what each binary says about itself; it is not proof of behavioral or storage compatibility.",
  labelOldFile: "Old file",
  labelNewFile: "New file",
  labelOldHash: "Old code hash (SHA-256)",
  labelNewHash: "New code hash (SHA-256)",
  labelOldSize: "Old size",
  labelNewSize: "New size",
  labelAdded: "Added declarations",
  labelRemoved: "Removed declarations",
  labelChanged: "Changed declarations",
  labelUnchanged: "Unchanged declarations",
  labelUnknown: "Unknown declarations",

  identicalTitle: "These binaries are byte-identical",
  identicalDescription:
    "Both files have the same SHA-256 code hash, so an upgrade between them would install the same code.",
  breakingTitle: "Declared interface changes may break existing callers",
  breakingDescription:
    "At least one declaration was removed or changed. Callers, bindings and indexers built against the old interface should be reviewed before upgrading.",
  additiveTitle: "Only additions were declared",
  additiveDescription:
    "Nothing declared in the old specification was removed or changed. Additions alone do not break callers of the old interface.",
  sameInterfaceTitle: "The declared interface is unchanged",
  sameInterfaceDescription:
    "Every function, type and error decoded from both specifications matches. The code itself still differs.",
  incompleteTitle: "Evidence is incomplete",
  incompleteDescription:
    "At least one specification could not be read, or a name collided. Affected declarations are labelled unknown rather than treated as added, removed or unchanged.",

  declarationsTitle: "Declarations",
  declarationsEmpty: "Neither specification declares any function, type or error.",
  columnBefore: "Old",
  columnAfter: "New",
  absentValue: "—",

  environmentTitle: "Environment version (contractenvmetav0)",
  environmentChangedNote:
    "The environment interface version changed. The new binary targets a different Soroban host interface; confirm the network supports it before upgrading.",
  preReleaseNote:
    "A non-zero pre-release number means the binary was built against an unreleased host interface. Networks reject such code outside of test builds.",

  metadataTitle: "Publisher metadata (contractmetav0)",
  metadataEmpty: "No publisher metadata was declared by either binary.",
  columnKey: "Key",

  coverageTitle: "Evidence coverage",
  coverageDescription:
    "Which Soroban custom sections each file contained and whether they decoded with the installed SDK's XDR definitions.",
  columnSection: "Section",
  columnStatus: "Status",
  columnEntries: "Entries",
  columnBytes: "Bytes",
  duplicateNote: "appears {count} times in the {side} file. Identical repeats are merged; differing ones are reported as collisions or conflicts.",
  gapsTitle: "Gaps",
  noGaps: "No evidence gaps: both specifications decoded and no name collided.",
  collisionMember: "repeats the member {member}",
  collisionName: "is declared {count} times with different shapes",
  limitsTitle: "Known limits",
  limits: [
    "Only declared interfaces are compared. Behavior, storage layout and authorization logic are not analysed.",
    "Doc strings are excluded from the comparison.",
    "Function arguments are compared by position; struct fields and union, enum and error cases by name.",
    "Spec entry kinds newer than the installed SDK are reported as an unsupported variant, never guessed at.",
    "Each file is bounded to 1 MiB and is never compiled, instantiated or executed."
  ]
} as const;

export const sideLabels: Record<UpgradeSide, string> = {
  old: "old",
  new: "new"
};

export const kindLabels: Record<DeclarationKind, string> = {
  function: "Function",
  type: "Type",
  error: "Error enum"
};

export const statusLabels: Record<ChangeStatus, string> = {
  added: "Added",
  removed: "Removed",
  changed: "Changed",
  unchanged: "Unchanged",
  unknown: "Unknown"
};

export const impactLabels: Record<ChangeImpact, string> = {
  breaking: "May break callers",
  additive: "Additive",
  none: "No change",
  unknown: "Not assessed"
};

export const reasonLabels: Record<UnknownReason, string> = {
  spec_unavailable: "One specification could not be read, so this cannot be compared.",
  meta_unavailable: "One file's publisher metadata could not be read, so this cannot be compared.",
  env_unavailable: "One file's environment version is missing, undecodable or conflicting.",
  name_collision: "This name is declared more than once with different shapes, so it is ambiguous."
};

export const sectionLabels: Record<MetadataSection, string> = {
  contractspecv0: "Contract specification (contractspecv0)",
  contractenvmetav0: "Environment version (contractenvmetav0)",
  contractmetav0: "Publisher metadata (contractmetav0)"
};

export const evidenceLabels: Record<EvidenceStatus, string> = {
  present: "Decoded",
  absent: "Absent",
  malformed_data: "Malformed XDR",
  unsupported_variant: "Unsupported variant",
  conflicting: "Conflicting duplicates"
};

export const evidenceExplanations: Record<Exclude<EvidenceStatus, "present">, string> = {
  absent: "The section is not in this file, so there is no evidence to compare — this is not the same as an empty declaration.",
  malformed_data: "The section exists but its XDR is truncated or invalid, so none of it is trusted.",
  unsupported_variant:
    "The section uses an entry kind the installed SDK does not define, likely from a newer protocol. It is not guessed at.",
  conflicting: "The section appears more than once and the copies disagree, so neither value is trusted."
};

export const errorCopy: Record<UpgradeErrorCode, { title: string; description: string }> = {
  invalid_input: {
    title: "Choose two Wasm files",
    description:
      "Both an old and a new non-empty .wasm file are needed. A file that only holds a secret key is refused outright and never displayed."
  },
  too_large: {
    title: "That file is larger than 1 MiB",
    description:
      "Each binary is bounded to 1,048,576 bytes. Soroban contract code is far smaller; check that you selected the optimised contract Wasm rather than a debug build or an archive."
  },
  malformed_data: {
    title: "That file is not a readable Wasm module",
    description:
      "Its header, a LEB128 length or a section boundary is invalid. Rebuild the contract or re-export the file, then try again."
  },
  unsupported_variant: {
    title: "That Wasm variant is not supported",
    description:
      "Only core Wasm binary version 1 with standard section ids is read. Component-model or future binary formats are refused rather than guessed at."
  },
  read_failed: {
    title: "The file could not be read",
    description: "Your browser could not read the selected file. Select it again, or copy it somewhere local first."
  }
};

/** Prefixes an error title with the side it belongs to. */
export function errorTitleFor(code: UpgradeErrorCode, side: UpgradeSide | undefined): string {
  const title = errorCopy[code].title;
  return side ? `${side === "old" ? "Old" : "New"} file: ${title}` : title;
}
