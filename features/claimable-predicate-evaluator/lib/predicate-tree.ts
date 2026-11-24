import { xdr } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import type { ErrorCode, Predicate } from "@/features/claimable-predicate-evaluator/types";
export const MAX_DEPTH = 16;
export const MAX_NODES = 128;
const MAX_INT64 = (1n << 63n) - 1n;
type Budget = { nodes: number };
function record(value: unknown): value is Record<string, unknown> { return !!value && typeof value === "object" && !Array.isArray(value); }
function integer(value: unknown): bigint | null {
  if (typeof value === "number") return Number.isSafeInteger(value) && value >= 0 ? BigInt(value) : null;
  if (typeof value !== "string" || value.length > 19 || !/^(0|[1-9]\d*)$/.test(value)) return null;
  const number = BigInt(value);
  return number <= MAX_INT64 ? number : null;
}
function enter(depth: number, budget: Budget): boolean { return depth <= MAX_DEPTH && ++budget.nodes <= MAX_NODES; }
/** Strict Horizon predicate union; unknown keys and multiple arms are rejected. */
export function decodeJsonPredicate(raw: unknown, depth = 0, budget: Budget = { nodes: 0 }): Result<Predicate, ErrorCode> {
  if (!enter(depth, budget)) return err("too_large");
  if (!record(raw)) return err("malformed_data");
  const keys = Object.keys(raw);
  const dualAbsolute = keys.length === 2 && keys.includes("abs_before") && keys.includes("abs_before_epoch");
  if (keys.length !== 1 && !dualAbsolute) return err("malformed_data");
  const key = keys[0];
  if (key === "unconditional") return raw.unconditional === true ? ok({ kind: "unconditional" }) : err("malformed_data");
  if (key === "abs_before" || key === "abs_before_epoch") {
    let seconds = integer(raw[key]);
    if (key === "abs_before" && seconds === null && typeof raw[key] === "string") {
      const time = raw[key];
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(time)) {
        const ms = Date.parse(time);
        if (Number.isFinite(ms) && ms >= 0 && new Date(ms).toISOString().replace(".000Z", "Z") === time) seconds = BigInt(ms / 1000);
      }
    }
    if (dualAbsolute) {
      const epoch = integer(raw.abs_before_epoch);
      const iso = raw.abs_before;
      if (epoch === null || typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(iso)) return err("malformed_data");
      const ms = Date.parse(iso);
      if (!Number.isFinite(ms) || ms < 0 || new Date(ms).toISOString().replace(".000Z", "Z") !== iso || BigInt(ms / 1000) !== epoch) return err("malformed_data");
      seconds = epoch;
    }
    return seconds !== null ? ok({ kind: "abs_before", seconds }) : err("malformed_data");
  }
  if (key === "rel_before") {
    const seconds = integer(raw.rel_before);
    return seconds !== null ? ok({ kind: "rel_before", seconds }) : err("malformed_data");
  }
  if (key === "not") {
    const child = decodeJsonPredicate(raw.not, depth + 1, budget);
    return child.ok ? ok({ kind: "not", child: child.value }) : child;
  }
  if (key === "and" || key === "or") {
    const children = raw[key];
    if (!Array.isArray(children) || children.length !== 2) return err("malformed_data");
    const left = decodeJsonPredicate(children[0], depth + 1, budget);
    if (!left.ok) return left;
    const right = decodeJsonPredicate(children[1], depth + 1, budget);
    return right.ok ? ok({ kind: key, children: [left.value, right.value] }) : right;
  }
  return err("unsupported_variant");
}
function decodeXdrNode(node: xdr.ClaimPredicate, depth: number, budget: Budget): Result<Predicate, ErrorCode> {
  if (!enter(depth, budget)) return err("too_large");
  const arm = node.switch().name;
  if (arm === "claimPredicateUnconditional") return ok({ kind: "unconditional" });
  if (arm === "claimPredicateBeforeAbsoluteTime" || arm === "claimPredicateBeforeRelativeTime") {
    const seconds = BigInt(arm === "claimPredicateBeforeAbsoluteTime" ? node.absBefore().toString() : node.relBefore().toString());
    if (seconds < 0n || seconds > MAX_INT64) return err("malformed_data");
    return ok({ kind: arm === "claimPredicateBeforeAbsoluteTime" ? "abs_before" : "rel_before", seconds });
  }
  if (arm === "claimPredicateNot") {
    const nested = node.notPredicate();
    if (!nested) return err("malformed_data");
    const child = decodeXdrNode(nested, depth + 1, budget);
    return child.ok ? ok({ kind: "not", child: child.value }) : child;
  }
  if (arm === "claimPredicateAnd" || arm === "claimPredicateOr") {
    const children = arm === "claimPredicateAnd" ? node.andPredicates() : node.orPredicates();
    if (children.length !== 2) return err("malformed_data");
    const left = decodeXdrNode(children[0], depth + 1, budget);
    if (!left.ok) return left;
    const right = decodeXdrNode(children[1], depth + 1, budget);
    return right.ok ? ok({ kind: arm === "claimPredicateAnd" ? "and" : "or", children: [left.value, right.value] }) : right;
  }
  return err("unsupported_variant");
}
export function decodePredicateXdr(encoded: string): Result<Predicate, ErrorCode> {
  try {
    const node = xdr.ClaimPredicate.fromXDR(encoded, "base64");
    if (node.toXDR("base64") !== encoded) return err("malformed_data");
    return decodeXdrNode(node, 0, { nodes: 0 });
  } catch { return err("malformed_data"); }
}
