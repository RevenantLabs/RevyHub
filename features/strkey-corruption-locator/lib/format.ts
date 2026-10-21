import { copy } from "@/features/strkey-corruption-locator/copy";
import type { CorrectionCandidate, PublicStrKeyKind } from "@/features/strkey-corruption-locator/types";

const KIND_LABELS: Record<PublicStrKeyKind, string> = {
  ed25519PublicKey: "Ed25519 public key",
  med25519PublicKey: "Muxed account",
  contract: "Contract",
  preAuthTx: "Pre-authorized transaction",
  sha256Hash: "SHA-256 hash",
  signedPayload: "Signed payload"
};

export function formatKind(kind: PublicStrKeyKind): string {
  return KIND_LABELS[kind];
}

export function formatLength(length: number): string {
  return `${length} character${length === 1 ? "" : "s"}`;
}

/** One-based position, matching how a person counts characters in a paste. */
export function formatSubstitution(candidate: CorrectionCandidate): string {
  return copy.substitution
    .replace("{position}", String(candidate.position + 1))
    .replace("{from}", candidate.originalCharacter)
    .replace("{to}", candidate.replacement);
}

export function formatCandidateCount(total: number): string {
  const template = total === 1 ? copy.candidateCount : copy.candidateCountPlural;
  return template.replace("{count}", String(total));
}

export function formatCandidateBound(shown: number, total: number): string {
  return copy.candidateBound.replace("{shown}", String(shown)).replace("{total}", String(total));
}
