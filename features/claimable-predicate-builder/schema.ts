import { err, ok, type Result } from "@/core/result/result";
import type {
  ClaimablePredicateBuilderErrorCode,
  ClaimablePredicateBuilderInput,
  PredicateNode
} from "@/features/claimable-predicate-builder/types";

const MAX_DEPTH = 5;

/** Parses raw form input into a validated predicate tree, without throwing. */
export function parseClaimablePredicateBuilderInput(
  raw: string
): Result<ClaimablePredicateBuilderInput, ClaimablePredicateBuilderErrorCode> {
  const value = raw.trim();
  if (!value) return err("empty_input");

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return err("invalid_input", "Invalid JSON");
  }

  const predicate = validatePredicateNode(parsed, 0);
  if (predicate.ok === false) return predicate;

  return ok({ predicate: predicate.value });
}

function validatePredicateNode(
  node: unknown,
  depth: number
): Result<PredicateNode, ClaimablePredicateBuilderErrorCode> {
  if (depth > MAX_DEPTH) return err("too_deeply_nested");

  if (!node || typeof node !== "object" || Array.isArray(node)) {
    return err("invalid_input", "Predicate must be an object");
  }

  const record = node as Record<string, unknown>;
  const type = record.type;
  if (typeof type !== "string") {
    return err("invalid_input", "Predicate must have a string 'type' field");
  }

  switch (type) {
    case "unconditional":
      return ok({ type: "unconditional" });

    case "abs_before":
    case "abs_after": {
      const timestamp = record.timestamp;
      if (typeof timestamp !== "number" || !Number.isFinite(timestamp) || timestamp < 0) {
        return err("invalid_time_bound", `${type} requires a non-negative numeric timestamp`);
      }
      return ok({ type, timestamp });
    }

    case "rel_before":
    case "rel_after": {
      const seconds = record.seconds;
      if (
        typeof seconds !== "number" ||
        !Number.isInteger(seconds) ||
        seconds < 0
      ) {
        return err("invalid_time_bound", `${type} requires a non-negative integer seconds value`);
      }
      return ok({ type, seconds });
    }

    case "not": {
      const child = validatePredicateNode(record.child, depth + 1);
      if (child.ok === false) return child;
      return ok({ type: "not", child: child.value });
    }

    case "and":
    case "or": {
      const children = record.children;
      if (!Array.isArray(children) || children.length !== 2) {
        return err("invalid_input", `${type} requires exactly two children`);
      }
      const left = validatePredicateNode(children[0], depth + 1);
      if (left.ok === false) return left;
      const right = validatePredicateNode(children[1], depth + 1);
      if (right.ok === false) return right;
      return ok({ type, children: [left.value, right.value] });
    }

    default:
      return err("invalid_input", `Unknown predicate type: ${type}`);
  }
}
