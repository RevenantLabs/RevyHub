/** Which of the two uploaded binaries a value or failure belongs to. */
export type UpgradeSide = "old" | "new";

/**
 * Failures that stop a report from being produced at all.
 *
 * Problems *inside* a well-framed Wasm module (a truncated spec section, an
 * unknown spec entry kind, two disagreeing environment versions) are not
 * errors: they become evidence gaps on an otherwise successful report, so the
 * rest of the comparison is still shown and the gap is labelled as unknown.
 */
export type UpgradeErrorCode =
  /** A file is missing, empty or is not a Wasm upload (for example a pasted secret key). */
  | "invalid_input"
  /** A file exceeds the 1 MiB bound. */
  | "too_large"
  /** The Wasm framing itself cannot be read: bad magic, LEB128 or section bounds. */
  | "malformed_data"
  /** A Wasm binary version or section id this tool does not understand. */
  | "unsupported_variant"
  /** The browser could not read the selected file. */
  | "read_failed";

export interface UpgradeErrorDetail {
  side: UpgradeSide;
}

/** What the form hands over: the two selected files, either possibly absent. */
export interface RawUpgradeFiles {
  oldFile: File | null;
  newFile: File | null;
}

/** A validated upload whose size has been checked but whose bytes are not yet read. */
export interface ValidatedUpgradeFiles {
  oldFile: File;
  newFile: File;
}

/** One side's bytes after the bound has been re-checked against what was actually read. */
export interface WasmUpload {
  side: UpgradeSide;
  /** Display name, already reduced to inert, bounded text. */
  fileName: string;
  bytes: Uint8Array;
}

export interface UpgradeInput {
  old: WasmUpload;
  new: WasmUpload;
}

/** The three custom sections the Soroban toolchain writes. */
export const METADATA_SECTIONS = ["contractspecv0", "contractenvmetav0", "contractmetav0"] as const;
export type MetadataSection = (typeof METADATA_SECTIONS)[number];

/**
 * How much a section can be trusted.
 *
 * `absent` and an empty-but-present section are deliberately different: a
 * present section with zero entries is a valid empty result, an absent one is
 * missing evidence.
 */
export type EvidenceStatus =
  | "present"
  | "absent"
  | "malformed_data"
  | "unsupported_variant"
  | "conflicting";

export interface SectionEvidence {
  section: MetadataSection;
  status: EvidenceStatus;
  /** How many custom sections carried this name. More than one is a duplicate. */
  sectionCount: number;
  /** Entries decoded across every section of this name (0 when not decodable). */
  entryCount: number;
  byteLength: number;
}

export type DeclarationKind = "function" | "type" | "error";

/** One labelled, comparable piece of a declaration, e.g. `argument 1` → `to: Address`. */
export interface DeclarationPart {
  label: string;
  value: string;
}

export interface Declaration {
  kind: DeclarationKind;
  /** Stable source name: function name or user-defined type name. */
  name: string;
  /** Canonical single-line rendering, used for equality. Docs are excluded. */
  signature: string;
  parts: DeclarationPart[];
}

/**
 * Two or more different declarations sharing one stable name in the same
 * file, or — when `member` is set — one declaration whose own members
 * (fields, cases, argument names) repeat a name.
 */
export interface NameCollision {
  scope: "function" | "udt" | "metadata";
  name: string;
  count: number;
  member?: string;
}

export interface EnvVersion {
  protocol: number;
  preRelease: number;
}

export interface MetadataEntry {
  key: string;
  value: string;
}

/** Everything read out of one Wasm file, without executing it. */
export interface WasmInterface {
  side: UpgradeSide;
  fileName: string;
  byteLength: number;
  /** Lowercase hex SHA-256 of the full uploaded bytes — the Soroban Wasm hash. */
  codeHash: string;
  sections: Record<MetadataSection, SectionEvidence>;
  /** `null` when the specification is unavailable, so nothing can be asserted. */
  declarations: Declaration[] | null;
  collisions: NameCollision[];
  /** `null` when the environment version is absent, undecodable or conflicting. */
  environment: EnvVersion | null;
  /** `null` when publisher metadata is absent or undecodable. */
  metadata: MetadataEntry[] | null;
}

export type ChangeStatus = "added" | "removed" | "changed" | "unchanged" | "unknown";

export type UnknownReason = "spec_unavailable" | "meta_unavailable" | "env_unavailable" | "name_collision";

/** Conservative reading of what a change means for existing callers. */
export type ChangeImpact = "breaking" | "additive" | "none" | "unknown";

export interface PartChange {
  label: string;
  before: string | null;
  after: string | null;
  status: Exclude<ChangeStatus, "unknown">;
}

export interface DeclarationChange {
  kind: DeclarationKind;
  name: string;
  status: ChangeStatus;
  impact: ChangeImpact;
  before: Declaration | null;
  after: Declaration | null;
  parts: PartChange[];
  reason?: UnknownReason;
}

export interface EnvironmentChange {
  before: EnvVersion | null;
  after: EnvVersion | null;
  status: ChangeStatus;
  reason?: UnknownReason;
}

export interface MetadataChange {
  key: string;
  before: string | null;
  after: string | null;
  status: ChangeStatus;
  reason?: UnknownReason;
}

export type EvidenceGap =
  | {
      type: "section";
      side: UpgradeSide;
      section: MetadataSection;
      status: Exclude<EvidenceStatus, "present">;
    }
  | ({ type: "collision"; side: UpgradeSide } & NameCollision);

export interface UpgradeReport {
  old: WasmInterface;
  new: WasmInterface;
  codeIdentical: boolean;
  declarations: DeclarationChange[];
  environment: EnvironmentChange;
  metadata: MetadataChange[];
  counts: Record<ChangeStatus, number>;
  gaps: EvidenceGap[];
  /** Custom sections that appeared more than once, by side. Informational. */
  duplicateSections: { side: UpgradeSide; section: MetadataSection; count: number }[];
  /** True only when both specifications decoded and no name collided. */
  interfaceComplete: boolean;
}
