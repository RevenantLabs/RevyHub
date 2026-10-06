import type { FieldGroup, FieldType } from "@/features/sep12-fields/types";

const GROUP_LABELS: Record<FieldGroup, string> = {
  natural_person: "Natural person",
  organization: "Organization",
  financial_account: "Financial account"
};

const TYPE_LABELS: Record<FieldType, string> = {
  string: "Text",
  date: "Date",
  country_code: "Country code",
  language_code: "Language code",
  binary: "Binary image",
  enum: "One of a fixed set"
};

export function formatGroup(group: FieldGroup): string {
  return GROUP_LABELS[group];
}

export function formatType(type: FieldType): string {
  return TYPE_LABELS[type];
}

/**
 * Derives the camelCase spelling an integration is likely to reach for.
 *
 * SEP-9 names are snake_case, and a near-miss spelling is exactly the failure
 * this tool exists to catch, so the variant is derived from the canonical name
 * rather than stored beside it — two hand-maintained lists drift apart, one
 * derived list cannot.
 *
 * The prefix is kept verbatim for names like organization.VAT_number, because
 * the prefix is part of the name rather than a namespace to be re-cased.
 */
export function toCamelCase(name: string): string {
  const dot = name.lastIndexOf(".");
  const prefix = dot === -1 ? "" : name.slice(0, dot + 1);
  const local = dot === -1 ? name : name.slice(dot + 1);
  const parts = local.split("_");

  return prefix + parts
    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join("");
}

/** Reports the size of a result in a way that never reads as a bare zero. */
export function formatMatchCount(matched: number, total: number): string {
  if (matched === 0) return "No fields match this search";
  if (matched === 1) return "1 of " + String(total) + " fields matches";
  return String(matched) + " of " + String(total) + " fields match";
}
