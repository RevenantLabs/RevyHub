import { xdr } from "@stellar/stellar-sdk";
import type {
  PredicateBuilderResult,
  PredicateNode
} from "@/features/predicate-builder/types";

/** Unconditional predicate: can be claimed at any time */
export const unconditionalPredicate: PredicateNode = {
  type: "unconditional"
};

/** Before absolute time: Jan 1, 2027 00:00:00 UTC */
export const absoluteTimestamp = 1798761600; // Unix seconds
export const beforeAbsolutePredicate: PredicateNode = {
  type: "before_absolute",
  timestamp: absoluteTimestamp
};

/** Before relative time: within 1 day (86400 seconds) */
export const beforeRelativePredicate: PredicateNode = {
  type: "before_relative",
  seconds: 86400
};

/** AND: unconditional AND before_absolute */
export const andPredicate: PredicateNode = {
  type: "and",
  children: [unconditionalPredicate, beforeAbsolutePredicate]
};

/** OR: before_absolute OR before_relative */
export const orPredicate: PredicateNode = {
  type: "or",
  children: [beforeAbsolutePredicate, beforeRelativePredicate]
};

/** NOT: negates unconditional */
export const notPredicate: PredicateNode = {
  type: "not",
  child: unconditionalPredicate
};

/** Complex nested: AND(before_absolute, OR(unconditional, NOT(before_relative))) */
export const nestedPredicate: PredicateNode = {
  type: "and",
  children: [
    beforeAbsolutePredicate,
    {
      type: "or",
      children: [
        unconditionalPredicate,
        {
          type: "not",
          child: beforeRelativePredicate
        }
      ]
    }
  ]
};

/**
 * Generate expected XDR for a predicate by encoding it with the SDK.
 */
function generateXdr(predicate: PredicateNode): string {
  const buildXdr = (node: PredicateNode): xdr.ClaimPredicate => {
    switch (node.type) {
      case "unconditional":
        return xdr.ClaimPredicate.claimPredicateUnconditional();
      case "before_absolute":
        return xdr.ClaimPredicate.claimPredicateBeforeAbsoluteTime(
          xdr.Int64.fromString(String(node.timestamp))
        );
      case "before_relative":
        return xdr.ClaimPredicate.claimPredicateBeforeRelativeTime(
          xdr.Int64.fromString(String(node.seconds))
        );
      case "and":
        return xdr.ClaimPredicate.claimPredicateAnd(node.children.map(buildXdr));
      case "or":
        return xdr.ClaimPredicate.claimPredicateOr(node.children.map(buildXdr));
      case "not":
        return xdr.ClaimPredicate.claimPredicateNot(buildXdr(node.child));
    }
  };

  return buildXdr(predicate).toXDR("base64");
}

export const unconditionalResult: PredicateBuilderResult = {
  predicate: unconditionalPredicate,
  plainLanguage: "the balance can be claimed at any time",
  xdrBase64: generateXdr(unconditionalPredicate)
};

export const beforeAbsoluteResult: PredicateBuilderResult = {
  predicate: beforeAbsolutePredicate,
  plainLanguage: "the claim is made before 2027-01-01 00:00:00 UTC",
  xdrBase64: generateXdr(beforeAbsolutePredicate)
};

export const beforeRelativeResult: PredicateBuilderResult = {
  predicate: beforeRelativePredicate,
  plainLanguage: "the claim is made within 1 day after the balance was created",
  xdrBase64: generateXdr(beforeRelativePredicate)
};

export const andResult: PredicateBuilderResult = {
  predicate: andPredicate,
  plainLanguage:
    "the balance can be claimed at any time AND the claim is made before 2027-01-01 00:00:00 UTC",
  xdrBase64: generateXdr(andPredicate)
};
