/**
 * Masks a Stellar identifier while preserving type context.
 * - Account IDs (G...): "G•••abcd"
 * - Transaction hashes: "#•••abcd"
 * - Issuers (G...): "G•••abcd"
 * - Generic fallback: "•••ab"
 */
export function redactValue(value: string, label: string): string {
  const lowerLabel = label.toLowerCase();

  if (lowerLabel.includes("hash") || lowerLabel.includes("transaction")) {
    if (value.length <= 5) return "•••";
    return `#•••${value.slice(-4)}`;
  }

  if (lowerLabel.includes("account") || lowerLabel.includes("issuer") || value.startsWith("G")) {
    if (value.length <= 5) return "•••";
    return `G•••${value.slice(-4)}`;
  }

  // Generic redaction for unknown identifier types
  if (value.length <= 4) return "•••";
  return `•••${value.slice(-2)}`;
}

/**
 * Builds an accessible label for a redacted value.
 */
export function redactedAriaLabel(label: string): string {
  return `Redacted ${label}. Copying is not available while redaction is active.`;
}
