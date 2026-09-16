import type {
  ClaimTimelineEntry,
  PredicateNode
} from "@/features/claimable-predicate-builder/types";

/** Formats a summary string for display. */
export function formatSummary(value: string): string {
  return value.trim();
}

/** Formats a Unix millisecond timestamp as a UTC ISO string. */
export function formatTimestamp(ms: number): string {
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return String(ms);
  return date.toISOString().replace("T", " ").replace(".000Z", " UTC");
}

/** Formats a duration in milliseconds as human-readable text. */
export function formatDuration(ms: number): string {
  if (ms <= 0) return "0 seconds";

  const secondsTotal = Math.floor(ms / 1000);
  const days = Math.floor(secondsTotal / 86_400);
  const hours = Math.floor((secondsTotal % 86_400) / 3_600);
  const minutes = Math.floor((secondsTotal % 3_600) / 60);
  const seconds = secondsTotal % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} second${seconds === 1 ? "" : "s"}`);

  return parts.join(", ");
}

/** Builds a plain-language description of a predicate tree. */
export function describePredicate(predicate: PredicateNode): string {
  switch (predicate.type) {
    case "unconditional":
      return "can be claimed at any time";

    case "abs_before":
      return `before ${formatTimestamp(predicate.timestamp)}`;

    case "abs_after":
      return `from ${formatTimestamp(predicate.timestamp)} onward`;

    case "rel_before":
      return `within ${formatDuration(predicate.seconds * 1000)} after the balance was created`;

    case "rel_after":
      return `at least ${formatDuration(predicate.seconds * 1000)} after the balance was created`;

    case "not":
      return `not (${describePredicate(predicate.child)})`;

    case "and":
      return `${describePredicate(predicate.children[0])} and ${describePredicate(predicate.children[1])}`;

    case "or":
      return `${describePredicate(predicate.children[0])} or ${describePredicate(predicate.children[1])}`;
  }
}

function intersect(a: ClaimTimelineEntry, b: ClaimTimelineEntry): ClaimTimelineEntry | null {
  const from = Math.max(a.from, b.from);
  const to = a.to === null ? b.to : b.to === null ? a.to : Math.min(a.to, b.to);
  if (to !== null && from > to) return null;
  return { from, to };
}

function unionIntervals(intervals: ClaimTimelineEntry[]): ClaimTimelineEntry[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.from - b.from);
  const merged: ClaimTimelineEntry[] = [];
  let current = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    if (current.to === null || next.from <= current.to) {
      current = {
        from: current.from,
        to: current.to === null || next.to === null ? null : Math.max(current.to, next.to)
      };
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);
  return merged;
}

function complementIntervals(intervals: ClaimTimelineEntry[]): ClaimTimelineEntry[] {
  if (intervals.length === 0) return [{ from: 0, to: null }];
  const sorted = [...intervals].sort((a, b) => a.from - b.from);
  const result: ClaimTimelineEntry[] = [];
  let cursor = 0;
  for (const interval of sorted) {
    if (interval.from > cursor) {
      result.push({ from: cursor, to: interval.from });
    }
    cursor = interval.to === null ? Infinity : interval.to + 1;
    if (!Number.isFinite(cursor)) break;
  }
  if (Number.isFinite(cursor)) {
    result.push({ from: cursor, to: null });
  }
  return result;
}

/**
 * Computes the intervals (relative to balance creation, in milliseconds)
 * during which the predicate is satisfied.
 */
export function computeTimeline(predicate: PredicateNode): ClaimTimelineEntry[] {
  switch (predicate.type) {
    case "unconditional":
      return [{ from: 0, to: null }];

    case "abs_before":
      return [{ from: 0, to: predicate.timestamp }];

    case "abs_after":
      return [{ from: predicate.timestamp, to: null }];

    case "rel_before":
      return [{ from: 0, to: predicate.seconds * 1000 }];

    case "rel_after":
      return [{ from: predicate.seconds * 1000, to: null }];

    case "not":
      return complementIntervals(computeTimeline(predicate.child));

    case "and": {
      const left = computeTimeline(predicate.children[0]);
      const right = computeTimeline(predicate.children[1]);
      const pairs: ClaimTimelineEntry[] = [];
      for (const a of left) {
        for (const b of right) {
          const inter = intersect(a, b);
          if (inter) pairs.push(inter);
        }
      }
      return unionIntervals(pairs);
    }

    case "or":
      return unionIntervals([
        ...computeTimeline(predicate.children[0]),
        ...computeTimeline(predicate.children[1])
      ]);
  }
}

/** Checks whether a predicate can never be satisfied. */
export function isUnsatisfiable(predicate: PredicateNode): boolean {
  const timeline = computeTimeline(predicate);
  if (timeline.length === 0) return true;
  // Also treat an interval that starts at Infinity as empty.
  return timeline.every((entry) => entry.to !== null && entry.from > entry.to);
}
