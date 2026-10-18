import type {
  CandidateMatchKind,
  EnvelopeVariant,
  SignatureGroup
} from "@/features/signature-hint-auditor/types";
import { copy, groupLabels } from "@/features/signature-hint-auditor/copy";

const VARIANT_LABELS: Record<EnvelopeVariant, string> = {
  "classic-v0": copy.variantClassicV0,
  "classic-v1": copy.variantClassicV1,
  "fee-bump": copy.variantFeeBump
};

const MATCH_LABELS: Record<CandidateMatchKind, string> = {
  none: copy.matchNone,
  single: copy.matchSingle,
  collision: copy.matchCollision
};

export function formatEnvelopeVariant(variant: EnvelopeVariant): string {
  return VARIANT_LABELS[variant];
}

export function formatSignatureGroup(group: SignatureGroup): string {
  return groupLabels[group];
}

export function formatMatchKind(kind: CandidateMatchKind): string {
  return MATCH_LABELS[kind];
}

/** Lowercase hex hint with a readable `0x` prefix for display. */
export function formatHint(hint: string): string {
  return `0x${hint}`;
}

export function formatSignatureCount(count: number): string {
  return count === 1 ? "1 signature" : `${count} signatures`;
}

export function formatCandidateCount(count: number): string {
  if (count === 0) return copy.noCandidates;
  if (count === 1) return copy.oneCandidate;
  return copy.collisionLabel;
}

export function formatIndex(index: number): string {
  return `#${index}`;
}
