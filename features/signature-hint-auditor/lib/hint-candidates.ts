import type {
  CandidateMatchKind,
  DecoratedSignatureEntry,
  HintCandidateMatch,
  PublicSignerHint,
  SignatureGroup,
  SignatureGroupReport
} from "@/features/signature-hint-auditor/types";

function matchKindFor(count: number): CandidateMatchKind {
  if (count === 0) return "none";
  if (count === 1) return "single";
  return "collision";
}

/**
 * Maps one decorated hint to zero or more provided public-key candidates.
 *
 * A collision is reported whenever more than one candidate shares the hint —
 * the auditor never picks a winner, because a four-byte match is not proof.
 */
export function candidatesForHint(
  hint: string,
  signers: PublicSignerHint[]
): string[] {
  return signers.filter((signer) => signer.hint === hint).map((signer) => signer.publicKey);
}

export function matchDecoratedHint(
  entry: DecoratedSignatureEntry,
  signers: PublicSignerHint[]
): HintCandidateMatch {
  const candidates = candidatesForHint(entry.hint, signers);
  return {
    index: entry.index,
    hint: entry.hint,
    group: entry.group,
    candidates,
    matchKind: matchKindFor(candidates.length)
  };
}

const CLASSIC_GROUPS: SignatureGroup[] = ["transaction"];
const FEE_BUMP_GROUPS: SignatureGroup[] = ["fee_bump_outer", "fee_bump_inner"];

/**
 * Builds per-group reports while preserving original signature order.
 *
 * The group list comes from the envelope variant so an unsigned classic
 * envelope still shows one empty transaction group, and an unsigned fee bump
 * still shows both outer and inner groups — without inventing fee-bump
 * sections for a classic envelope.
 */
export function buildGroupReports(
  entries: DecoratedSignatureEntry[],
  signers: PublicSignerHint[],
  groups: SignatureGroup[]
): SignatureGroupReport[] {
  return groups.map((group) => ({
    group,
    signatures: entries
      .filter((entry) => entry.group === group)
      .map((entry) => matchDecoratedHint(entry, signers))
  }));
}

export function groupsForVariant(
  variant: "classic-v0" | "classic-v1" | "fee-bump"
): SignatureGroup[] {
  return variant === "fee-bump" ? FEE_BUMP_GROUPS : CLASSIC_GROUPS;
}

export function countCollisions(matches: HintCandidateMatch[]): number {
  return matches.filter((match) => match.matchKind === "collision").length;
}

export function countUnmatched(matches: HintCandidateMatch[]): number {
  return matches.filter((match) => match.matchKind === "none").length;
}
