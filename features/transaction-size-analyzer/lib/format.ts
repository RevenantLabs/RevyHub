import type { LayerBreakdown, SizeSection } from "@/features/transaction-size-analyzer/types";

/**
 * Formats a byte count with thousands separators.
 *
 * Deliberately not "1.2 KB": this tool exists because approximate sizes were
 * the problem, and a rounded unit would put an approximation back on screen.
 */
export function formatBytes(bytes: number): string {
  const suffix = bytes === 1 ? "byte" : "bytes";
  return `${bytes.toLocaleString("en-US")} ${suffix}`;
}

export function formatCharacters(length: number): string {
  const suffix = length === 1 ? "character" : "characters";
  return `${length.toLocaleString("en-US")} ${suffix}`;
}

/**
 * Share of a layer that a section accounts for, as a whole percentage.
 *
 * Percentages are presentation only — the byte numbers beside them are the
 * ones that add up, and these are allowed to not total exactly 100 % because
 * each is rounded independently.
 */
export function sectionShare(section: SizeSection, totalBytes: number): number {
  if (totalBytes <= 0) return 0;
  return Math.round((section.bytes / totalBytes) * 100);
}

export function formatShare(section: SizeSection, totalBytes: number): string {
  return `${sectionShare(section, totalBytes)}%`;
}

/**
 * Base64 encodes three bytes as four characters, so the string is always
 * about a third longer than the payload. Reporting the overhead explicitly is
 * the whole point of separating the two numbers.
 */
export function base64Overhead(totalBytes: number, base64Length: number): number {
  return base64Length - totalBytes;
}

/** Proves the reported sections are exhaustive, for display beside them. */
export function sectionsTotal(layer: LayerBreakdown): number {
  return layer.sections.reduce((total, section) => total + section.bytes, 0);
}

export function formatOperationLabel(index: number, bytes: number): string {
  return `Operation ${index + 1} — ${formatBytes(bytes)}`;
}

export function formatSignatureLabel(index: number, bytes: number): string {
  return `Signature ${index + 1} — ${formatBytes(bytes)}`;
}
