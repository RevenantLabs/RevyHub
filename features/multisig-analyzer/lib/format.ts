import type {
  MultisigAnalyzerResult,
  ThresholdLevel
} from "@/features/multisig-analyzer/types";

export function formatThreshold(value: ThresholdLevel): string {
  return {
    low: "Low",
    medium: "Medium",
    high: "High"
  }[value] ?? value;
}

export function formatShortfall(value: string): string {
  return BigInt(value).toString();
}

/** Presentation-only helpers. Keep formatting out of components and logic. */
export function formatSummary(result: MultisigAnalyzerResult): string {
  const threshold = formatThreshold(result.requiredThreshold);
  const missing = result.missingSigners.length
    ? result.missingSigners
        .map((signer) => `${signer.key.slice(0, 6)}…${signer.key.slice(-4)} (${signer.weight})`)
        .join(", ")
    : "none";

  return `${threshold} threshold requires ${result.requiredWeight} weight. Current signature weight is ${result.signatureWeight}; ${result.shortfallWeight} is still missing. Remaining signers: ${missing}.`;
}
