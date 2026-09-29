import { xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type {
  PredicateBuilderErrorCode,
  PredicateBuilderInput,
  PredicateBuilderResult,
  PredicateNode
} from "@/features/predicate-builder/types";
import { toPredicateBuilderErrorCode } from "@/features/predicate-builder/lib/predicateBuilder.errors";

/**
 * Converts internal PredicateNode to xdr.ClaimPredicate.
 * 
 * This is the core XDR encoding logic that runs entirely client-side.
 */
function nodeToClaimPredicate(node: PredicateNode): xdr.ClaimPredicate {
  switch (node.type) {
    case "unconditional":
      return xdr.ClaimPredicate.claimPredicateUnconditional();

    case "before_absolute": {
      const timestamp = xdr.Int64.fromString(String(node.timestamp));
      return xdr.ClaimPredicate.claimPredicateBeforeAbsoluteTime(timestamp);
    }

    case "before_relative": {
      const duration = xdr.Int64.fromString(String(node.seconds));
      return xdr.ClaimPredicate.claimPredicateBeforeRelativeTime(duration);
    }

    case "and": {
      const predicates = node.children.map(nodeToClaimPredicate);
      return xdr.ClaimPredicate.claimPredicateAnd(predicates);
    }

    case "or": {
      const predicates = node.children.map(nodeToClaimPredicate);
      return xdr.ClaimPredicate.claimPredicateOr(predicates);
    }

    case "not": {
      const predicate = nodeToClaimPredicate(node.child);
      return xdr.ClaimPredicate.claimPredicateNot(predicate);
    }
  }
}

/**
 * Generates a plain-language description of the predicate.
 * 
 * This makes the predicate understandable to non-technical users.
 */
function describePredicateNode(node: PredicateNode): string {
  switch (node.type) {
    case "unconditional":
      return "the balance can be claimed at any time";

    case "before_absolute": {
      const date = new Date(node.timestamp * 1000);
      const formatted = date.toISOString().replace("T", " ").replace(".000Z", " UTC");
      return `the claim is made before ${formatted}`;
    }

    case "before_relative": {
      const duration = formatDuration(node.seconds);
      return `the claim is made within ${duration} after the balance was created`;
    }

    case "and": {
      const parts = node.children.map(describePredicateNode);
      if (parts.length === 2) {
        return `${parts[0]} AND ${parts[1]}`;
      }
      return parts.map((p, index) => `  ${index + 1}. ${p}`).join("\n");
    }

    case "or": {
      const parts = node.children.map(describePredicateNode);
      if (parts.length === 2) {
        return `${parts[0]} OR ${parts[1]}`;
      }
      const formatted = parts.map((p, i) => `  • ${p}`).join("\n OR\n");
      return `either:\n${formatted}`;
    }

    case "not": {
      const inner = describePredicateNode(node.child);
      return `NOT (${inner})`;
    }
  }
}

/**
 * Formats a duration in seconds into human-readable form.
 */
function formatDuration(seconds: number): string {
  const units: Array<[number, string]> = [
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"]
  ];

  for (const [size, label] of units) {
    if (seconds % size === 0 && seconds >= size) {
      const count = seconds / size;
      return `${count} ${label}${count === 1 ? "" : "s"}`;
    }
  }

  return `${seconds.toLocaleString("en-US")} second${seconds === 1 ? "" : "s"}`;
}

/**
 * Builds and encodes a claimable balance predicate.
 * 
 * Everything happens client-side:
 * 1. Converts PredicateNode → xdr.ClaimPredicate
 * 2. Generates plain-language description
 * 3. Encodes to base64 XDR
 * 
 * Never throws for validation failures - returns Result.
 */
export function buildPredicate(
  input: PredicateBuilderInput
): Result<PredicateBuilderResult, PredicateBuilderErrorCode> {
  try {
    const claimPredicate = nodeToClaimPredicate(input.predicate);
    const xdrBase64 = claimPredicate.toXDR("base64");
    const plainLanguage = describePredicateNode(input.predicate);

    return ok({
      predicate: input.predicate,
      plainLanguage,
      xdrBase64
    });
  } catch (error) {
    return err(toPredicateBuilderErrorCode(error));
  }
}
