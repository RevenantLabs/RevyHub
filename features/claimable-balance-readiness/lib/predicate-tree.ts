/** Horizon claim-predicate JSON as returned on claimable balances. */
export interface HorizonPredicate {
  unconditional?: boolean;
  and?: HorizonPredicate[];
  or?: HorizonPredicate[];
  not?: HorizonPredicate;
  abs_before?: string;
  abs_before_epoch?: string;
  abs_after?: string;
  abs_after_epoch?: string;
  rel_before?: string | number;
  rel_after?: string | number;
}

export type NormalizedPredicate =
  | { kind: "unconditional" }
  | { kind: "abs_before"; boundMs: number; boundIso: string }
  | { kind: "abs_after"; boundMs: number; boundIso: string }
  | { kind: "rel_before"; seconds: number }
  | { kind: "rel_after"; seconds: number }
  | { kind: "and"; children: [NormalizedPredicate, NormalizedPredicate] }
  | { kind: "or"; children: [NormalizedPredicate, NormalizedPredicate] }
  | { kind: "not"; child: NormalizedPredicate };

export type NormalizePredicateError = "unsupported_predicate";

function readEpoch(predicate: HorizonPredicate, key: "abs_before" | "abs_after"): number | null {
  const epochKey = key === "abs_before" ? "abs_before_epoch" : "abs_after_epoch";
  const epoch = predicate[epochKey];
  if (epoch !== undefined) {
    const value = Number(epoch);
    return Number.isFinite(value) ? value * 1000 : null;
  }

  const iso = predicate[key];
  if (!iso) return null;
  const parsed = Date.parse(iso);
  return Number.isNaN(parsed) ? null : parsed;
}

function readRelativeSeconds(value: string | number | undefined): number | null {
  if (value === undefined) return null;
  const seconds = typeof value === "number" ? value : Number(value);
  return Number.isFinite(seconds) ? seconds : null;
}

function formatAbsoluteIso(ms: number): string {
  return new Date(ms).toISOString().replace(".000Z", "Z");
}

export function isUnconditionalPredicate(predicate: HorizonPredicate): boolean {
  if (predicate.unconditional === true) return true;
  return Object.keys(predicate).length === 0;
}

/**
 * Normalize nested Horizon predicate JSON into a typed tree.
 * Returns unsupported_predicate when the shape cannot be recognized.
 */
export function normalizePredicate(
  predicate: HorizonPredicate
):
  | { ok: true; value: NormalizedPredicate }
  | { ok: false; code: NormalizePredicateError } {
  if (isUnconditionalPredicate(predicate)) {
    return { ok: true, value: { kind: "unconditional" } };
  }

  if (predicate.and?.length === 2) {
    const left = normalizePredicate(predicate.and[0]);
    if (!left.ok) return left;
    const right = normalizePredicate(predicate.and[1]);
    if (!right.ok) return right;
    return { ok: true, value: { kind: "and", children: [left.value, right.value] } };
  }

  if (predicate.or?.length === 2) {
    const left = normalizePredicate(predicate.or[0]);
    if (!left.ok) return left;
    const right = normalizePredicate(predicate.or[1]);
    if (!right.ok) return right;
    return { ok: true, value: { kind: "or", children: [left.value, right.value] } };
  }

  if (predicate.not) {
    const child = normalizePredicate(predicate.not);
    if (!child.ok) return child;
    return { ok: true, value: { kind: "not", child: child.value } };
  }

  const absBeforeMs = readEpoch(predicate, "abs_before");
  if (absBeforeMs !== null) {
    return {
      ok: true,
      value: { kind: "abs_before", boundMs: absBeforeMs, boundIso: formatAbsoluteIso(absBeforeMs) }
    };
  }

  const absAfterMs = readEpoch(predicate, "abs_after");
  if (absAfterMs !== null) {
    return {
      ok: true,
      value: { kind: "abs_after", boundMs: absAfterMs, boundIso: formatAbsoluteIso(absAfterMs) }
    };
  }

  const relBefore = readRelativeSeconds(predicate.rel_before);
  if (relBefore !== null) {
    return { ok: true, value: { kind: "rel_before", seconds: relBefore } };
  }

  const relAfter = readRelativeSeconds(predicate.rel_after);
  if (relAfter !== null) {
    return { ok: true, value: { kind: "rel_after", seconds: relAfter } };
  }

  return { ok: false, code: "unsupported_predicate" };
}

export function describeNormalizedPredicate(node: NormalizedPredicate): string {
  switch (node.kind) {
    case "unconditional":
      return "can be claimed at any time";
    case "abs_before":
      return `before ${formatDisplayTime(node.boundIso)}`;
    case "abs_after":
      return `from ${formatDisplayTime(node.boundIso)} onward`;
    case "rel_before":
      return `within ${formatRelativeSeconds(node.seconds)} after the balance was created`;
    case "rel_after":
      return `at least ${formatRelativeSeconds(node.seconds)} after the balance was created`;
    case "and":
      return `${describeNormalizedPredicate(node.children[0])} and ${describeNormalizedPredicate(node.children[1])}`;
    case "or":
      return `${describeNormalizedPredicate(node.children[0])} or ${describeNormalizedPredicate(node.children[1])}`;
    case "not":
      return `not (${describeNormalizedPredicate(node.child)})`;
  }
}

function formatDisplayTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toISOString().replace("T", " ").replace(".000Z", " UTC");
}

export function formatRelativeSeconds(seconds: number): string {
  const units: Array<[number, string]> = [
    [86_400, "day"],
    [3_600, "hour"],
    [60, "minute"]
  ];

  for (const [size, label] of units) {
    if (seconds % size === 0 && seconds >= size) {
      const count = seconds / size;
      return `${count} ${label}${count === 1 ? "" : "s"}`;
    }
  }

  return `${seconds.toLocaleString("en-US")} seconds`;
}
