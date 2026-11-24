import type {
  ChangeStatus,
  DeclarationChange,
  EnvVersion,
  EvidenceStatus
} from "@/features/contract-upgrade-diff-report/types";

/** Presentation-only helpers. Keep formatting out of components and logic. */

/** Exact byte count with grouping, e.g. `1,048,576 bytes`. Never rounded to KiB. */
export function formatByteSize(bytes: number): string {
  return `${bytes.toLocaleString("en-US")} ${bytes === 1 ? "byte" : "bytes"}`;
}

/** The full 64-character hash, lowercase. Identifiers are never truncated. */
export function formatCodeHash(hash: string): string {
  return hash.toLowerCase();
}

export function formatEnvVersion(version: EnvVersion | null): string {
  if (!version) return "Unknown";
  return version.preRelease === 0
    ? `Protocol ${version.protocol}`
    : `Protocol ${version.protocol}, pre-release ${version.preRelease}`;
}

/** An absent value is an em dash, an empty string is shown as such. */
export function formatSide(value: string | null): string {
  return value === null ? "—" : value || "(empty)";
}

/** Fills `{name}` placeholders in a copy string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

const STATUS_TONES: Record<ChangeStatus, "muted" | "warning" | "success" | "danger" | "info"> = {
  unchanged: "muted",
  changed: "warning",
  added: "success",
  removed: "danger",
  unknown: "info"
};

export function statusTone(status: ChangeStatus) {
  return STATUS_TONES[status];
}

export function evidenceTone(status: EvidenceStatus): "success" | "warning" | "danger" | "info" {
  if (status === "present") return "success";
  if (status === "absent") return "info";
  if (status === "conflicting") return "warning";
  return "danger";
}

/** Rows worth showing by default: everything except unchanged declarations. */
export function changedFirst(changes: DeclarationChange[]): DeclarationChange[] {
  const rank: Record<ChangeStatus, number> = { removed: 0, changed: 1, unknown: 2, added: 3, unchanged: 4 };
  return [...changes].sort((a, b) => rank[a.status] - rank[b.status]);
}
