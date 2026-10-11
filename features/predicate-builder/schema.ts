import { err, ok, type Result } from "@/core/result/result";
import type {
  PredicateBuilderErrorCode,
  PredicateBuilderField,
  PredicateBuilderInput,
  PredicateNode,
  RawPredicateForm
} from "@/features/predicate-builder/types";

export const FIELD_OF_CODE: Record<PredicateBuilderErrorCode, PredicateBuilderField> = {
  empty_predicate: null,
  invalid_timestamp: "timestamp",
  invalid_duration: "seconds",
  invalid_and_children: "children",
  invalid_or_children: "children",
  invalid_not_child: "child",
  unsupported_type: null,
  encoding_failed: null
};

const VALID_TYPES = [
  "unconditional",
  "before_absolute",
  "before_relative",
  "and",
  "or",
  "not"
] as const;

function isValidType(type: string): type is PredicateNode["type"] {
  return (VALID_TYPES as readonly string[]).includes(type);
}

/**
 * Parses an ISO 8601 timestamp into Unix seconds.
 */
function parseTimestamp(raw: string): Result<number, PredicateBuilderErrorCode> {
  const value = raw.trim();
  if (!value) return err("invalid_timestamp");

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return err("invalid_timestamp");

  // Convert to Unix seconds (xdr.Int64 expects seconds, not milliseconds)
  return ok(Math.floor(date.getTime() / 1000));
}

/**
 * Parses a duration in seconds.
 */
function parseDuration(raw: string): Result<number, PredicateBuilderErrorCode> {
  const value = raw.trim();
  if (!value) return err("invalid_duration");

  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0 || !Number.isInteger(seconds)) {
    return err("invalid_duration");
  }

  return ok(seconds);
}

/**
 * Recursively validates a predicate tree from raw form input.
 */
export function validatePredicateNode(
  raw: RawPredicateForm
): Result<PredicateNode, PredicateBuilderErrorCode> {
  if (!isValidType(raw.type)) return err("unsupported_type");

  switch (raw.type) {
    case "unconditional":
      return ok({ type: "unconditional" });

    case "before_absolute": {
      if (!raw.timestamp) return err("invalid_timestamp");
      const timestamp = parseTimestamp(raw.timestamp);
      return timestamp.ok
        ? ok({ type: "before_absolute", timestamp: timestamp.value })
        : timestamp;
    }

    case "before_relative": {
      if (!raw.seconds) return err("invalid_duration");
      const seconds = parseDuration(raw.seconds);
      return seconds.ok
        ? ok({ type: "before_relative", seconds: seconds.value })
        : seconds;
    }

    case "and": {
      if (!raw.children || raw.children.length < 2) return err("invalid_and_children");
      const children: PredicateNode[] = [];
      for (const childRaw of raw.children) {
        const child = validatePredicateNode(childRaw);
        if (!child.ok) return child;
        children.push(child.value);
      }
      return ok({ type: "and", children });
    }

    case "or": {
      if (!raw.children || raw.children.length < 2) return err("invalid_or_children");
      const children: PredicateNode[] = [];
      for (const childRaw of raw.children) {
        const child = validatePredicateNode(childRaw);
        if (!child.ok) return child;
        children.push(child.value);
      }
      return ok({ type: "or", children });
    }

    case "not": {
      if (!raw.child) return err("invalid_not_child");
      const child = validatePredicateNode(raw.child);
      return child.ok ? ok({ type: "not", child: child.value }) : child;
    }

    default:
      return err("unsupported_type");
  }
}

/**
 * Validates the entire predicate builder input.
 */
export function parsePredicateBuilderInput(
  raw: RawPredicateForm | null
): Result<PredicateBuilderInput, PredicateBuilderErrorCode> {
  if (!raw) return err("empty_predicate");

  const predicate = validatePredicateNode(raw);
  return predicate.ok ? ok({ predicate: predicate.value }) : predicate;
}
