import type {
  ChangeFilter,
  SectionFilter,
  SnapshotChange,
  SnapshotSection
} from "@/features/account-snapshot-diff/types";

/**
 * Formats a Stellar amount without going through `Number`.
 *
 * Trailing zeros are trimmed for readability, but nothing is rounded: the
 * digits shown are the digits in the snapshot.
 */
export function formatAmount(value: string): string {
  const negative = value.startsWith("-");
  const unsigned = negative ? value.slice(1) : value;
  const [whole, fraction = ""] = unsigned.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmed = fraction.replace(/0+$/, "");

  return `${negative ? "-" : ""}${trimmed ? `${grouped}.${trimmed}` : grouped}`;
}

/** A delta always carries its sign, so a decrease is never mistaken for a total. */
export function formatDelta(delta: string): string {
  const formatted = formatAmount(delta);
  return formatted.startsWith("-") ? formatted : `+${formatted}`;
}

/** An absent field is an em dash; an empty string says so explicitly. */
export function formatValue(value: string | null): string {
  if (value === null) return "—";
  return value === "" ? "(empty)" : value;
}

export function filterChanges(
  changes: SnapshotChange[],
  section: SectionFilter,
  change: ChangeFilter
): SnapshotChange[] {
  return changes.filter((entry) => {
    if (section !== "all" && entry.section !== section) return false;
    if (change === "changed") return entry.type !== "unchanged";
    if (change === "unchanged") return entry.type === "unchanged";
    return true;
  });
}

const SECTION_ORDER: readonly SnapshotSection[] = [
  "account",
  "balances",
  "signers",
  "thresholds",
  "flags",
  "data"
];

/** Sections that actually have rows, in a fixed reading order. */
export function occupiedSections(changes: SnapshotChange[]): SnapshotSection[] {
  return SECTION_ORDER.filter((section) => changes.some((change) => change.section === section));
}

export function changesInSection(
  changes: SnapshotChange[],
  section: SnapshotSection
): SnapshotChange[] {
  return changes.filter((change) => change.section === section);
}

/** Groups a section's rows by the identity they belong to, in first-seen order. */
export function groupByKey(changes: SnapshotChange[]): Map<string, SnapshotChange[]> {
  const groups = new Map<string, SnapshotChange[]>();

  for (const change of changes) {
    const existing = groups.get(change.key);
    if (existing) existing.push(change);
    else groups.set(change.key, [change]);
  }

  return groups;
}

/** Renders a balance identity readably without losing the issuer. */
export function formatBalanceKey(key: string): string {
  if (key === "native") return "XLM (native)";
  if (key.startsWith("pool:")) return `Liquidity pool ${key.slice(5)}`;
  return key;
}
