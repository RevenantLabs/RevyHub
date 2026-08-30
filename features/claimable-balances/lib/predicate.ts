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

export interface PredicateContext {
  /** Unix milliseconds when the balance was funded. */
  fundedAtMs: number;
  /** Evaluation instant, defaults to Date.now() in callers. */
  nowMs: number;
}

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

export function isUnconditionalPredicate(predicate: HorizonPredicate): boolean {
  if (predicate.unconditional === true) return true;
  return Object.keys(predicate).length === 0;
}

/** Pure recursive renderer — the core value of this tool. */
export function describePredicate(predicate: HorizonPredicate): string {
  if (isUnconditionalPredicate(predicate)) {
    return "can be claimed at any time";
  }

  if (predicate.and?.length === 2) {
    return `${describePredicate(predicate.and[0])} and ${describePredicate(predicate.and[1])}`;
  }

  if (predicate.or?.length === 2) {
    return `${describePredicate(predicate.or[0])} or ${describePredicate(predicate.or[1])}`;
  }

  if (predicate.not) {
    return `not (${describePredicate(predicate.not)})`;
  }

  if (predicate.abs_before) {
    return `before ${formatAbsoluteTime(predicate.abs_before)}`;
  }

  if (predicate.abs_after) {
    return `from ${formatAbsoluteTime(predicate.abs_after)} onward`;
  }

  const relBefore = readRelativeSeconds(predicate.rel_before);
  if (relBefore !== null) {
    return `within ${formatRelativeSeconds(relBefore)} after the balance was created`;
  }

  const relAfter = readRelativeSeconds(predicate.rel_after);
  if (relAfter !== null) {
    return `at least ${formatRelativeSeconds(relAfter)} after the balance was created`;
  }

  return "has an unrecognized predicate";
}

export function isPredicateClaimableNow(
  predicate: HorizonPredicate,
  context: PredicateContext
): boolean {
  if (isUnconditionalPredicate(predicate)) return true;

  if (predicate.and?.length === 2) {
    return (
      isPredicateClaimableNow(predicate.and[0], context) &&
      isPredicateClaimableNow(predicate.and[1], context)
    );
  }

  if (predicate.or?.length === 2) {
    return (
      isPredicateClaimableNow(predicate.or[0], context) ||
      isPredicateClaimableNow(predicate.or[1], context)
    );
  }

  if (predicate.not) {
    return !isPredicateClaimableNow(predicate.not, context);
  }

  const absBeforeMs = readEpoch(predicate, "abs_before");
  if (absBeforeMs !== null) {
    return context.nowMs < absBeforeMs;
  }

  const absAfterMs = readEpoch(predicate, "abs_after");
  if (absAfterMs !== null) {
    return context.nowMs >= absAfterMs;
  }

  const relBefore = readRelativeSeconds(predicate.rel_before);
  if (relBefore !== null) {
    return context.nowMs < context.fundedAtMs + relBefore * 1000;
  }

  const relAfter = readRelativeSeconds(predicate.rel_after);
  if (relAfter !== null) {
    return context.nowMs >= context.fundedAtMs + relAfter * 1000;
  }

  return false;
}

function formatAbsoluteTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toISOString().replace("T", " ").replace(".000Z", " UTC");
}

function formatRelativeSeconds(seconds: number): string {
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
