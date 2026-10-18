import type {
  DiffEntry,
  DiffFilter,
  DiffSection,
  DiffStatus
} from "@/features/transaction-envelope-diff/types";

/**
 * Applies the changed/unchanged filter.
 *
 * Filtering is a pure function of the entries and the current choice rather
 * than a second copy held in state, so the visible rows can never drift from
 * the diff they came from.
 */
export function filterEntries(entries: DiffEntry[], filter: DiffFilter): DiffEntry[] {
  if (filter === "all") return entries;
  if (filter === "changed") return entries.filter((entry) => entry.status !== "unchanged");
  return entries.filter((entry) => entry.status === "unchanged");
}

export function entriesInSection(entries: DiffEntry[], section: DiffSection): DiffEntry[] {
  return entries.filter((entry) => entry.section === section);
}

/** Sections that actually have rows, in a fixed reading order. */
const SECTION_ORDER: readonly DiffSection[] = ["envelope", "body", "operations", "signatures"];

export function occupiedSections(entries: DiffEntry[]): DiffSection[] {
  return SECTION_ORDER.filter((section) =>
    entries.some((entry) => entry.section === section)
  );
}

/** An absent field is shown as an em dash rather than as an empty cell. */
export function formatSide(value: string | null): string {
  return value === null ? "—" : value || "(empty)";
}

const STATUS_TONES: Record<DiffStatus, "muted" | "warning" | "success" | "danger"> = {
  unchanged: "muted",
  changed: "warning",
  added: "success",
  removed: "danger"
};

export function statusTone(status: DiffStatus) {
  return STATUS_TONES[status];
}

export function countByStatus(entries: DiffEntry[], status: DiffStatus): number {
  return entries.filter((entry) => entry.status === status).length;
}
