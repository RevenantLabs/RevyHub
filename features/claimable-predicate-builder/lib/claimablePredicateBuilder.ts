import { Claimant } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  ClaimablePredicateBuilderErrorCode,
  ClaimablePredicateBuilderInput,
  ClaimablePredicateBuilderResult,
  PredicateNode
} from "@/features/claimable-predicate-builder/types";
import {
  computeTimeline,
  describePredicate,
  isUnsatisfiable
} from "@/features/claimable-predicate-builder/lib/format";

/** Builds a Stellar XDR ClaimPredicate from a predicate tree. */
export function buildClaimPredicate(predicate: PredicateNode): ReturnType<typeof Claimant.predicateUnconditional> {
  switch (predicate.type) {
    case "unconditional":
      return Claimant.predicateUnconditional();

    case "abs_before":
      return Claimant.predicateBeforeAbsoluteTime(String(Math.floor(predicate.timestamp / 1000)));

    case "abs_after":
      return Claimant.predicateNot(
        Claimant.predicateBeforeAbsoluteTime(String(Math.floor(predicate.timestamp / 1000)))
      );

    case "rel_before":
      return Claimant.predicateBeforeRelativeTime(String(predicate.seconds));

    case "rel_after":
      return Claimant.predicateNot(Claimant.predicateBeforeRelativeTime(String(predicate.seconds)));

    case "not":
      return Claimant.predicateNot(buildClaimPredicate(predicate.child));

    case "and":
      return Claimant.predicateAnd(
        buildClaimPredicate(predicate.children[0]),
        buildClaimPredicate(predicate.children[1])
      );

    case "or":
      return Claimant.predicateOr(
        buildClaimPredicate(predicate.children[0]),
        buildClaimPredicate(predicate.children[1])
      );
  }
}

/** Core tool logic. Never throws for expected failures — returns a Result. */
export async function runClaimablePredicateBuilder(
  input: ClaimablePredicateBuilderInput
): Promise<Result<ClaimablePredicateBuilderResult, ClaimablePredicateBuilderErrorCode>> {
  const { predicate } = input;

  if (isUnsatisfiable(predicate)) {
    return err("unsatisfiable");
  }

  let xdrPredicate: ReturnType<typeof buildClaimPredicate>;
  try {
    xdrPredicate = buildClaimPredicate(predicate);
  } catch {
    return err("encoding_failed", "Unable to build the XDR predicate");
  }

  let xdr: string;
  try {
    xdr = xdrPredicate.toXDR("base64");
  } catch {
    return err("encoding_failed", "Unable to encode the predicate as XDR");
  }

  return ok({
    description: describePredicate(predicate),
    xdr,
    timeline: computeTimeline(predicate),
    unsatisfiable: false
  });
}
