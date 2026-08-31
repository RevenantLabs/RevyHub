import type { BadgeProps } from "@/core/ui/Badge";
import type { StatusType } from "@/core/ui/StatusMessage";
import type { BoundStatus, Verdict } from "@/features/preconditions-explainer/types";

/** Unix seconds beyond this cannot be represented by `Date`. */
const MAX_REPRESENTABLE_SECONDS = 8_640_000_000_000n;

const UNITS: readonly (readonly [bigint, string])[] = [
  [86_400n, "day"],
  [3_600n, "hour"],
  [60n, "minute"],
  [1n, "second"]
];

/**
 * Renders a whole-second Unix timestamp in UTC.
 *
 * Bounds are `uint64` seconds, so they are handled as `BigInt` all the way to
 * the point of rendering — a bound past year 275760 is reported as
 * out of range rather than silently becoming `Invalid Date`.
 */
export function formatUnixSeconds(seconds: string): string {
  const value = BigInt(seconds);
  if (value === 0n) return "Unbounded";
  if (value < 0n || value > MAX_REPRESENTABLE_SECONDS) return "Beyond any representable date";

  return new Date(Number(value) * 1000)
    .toISOString()
    .replace("T", " ")
    .replace(".000Z", " UTC");
}

/**
 * Renders a duration in seconds using its two largest non-zero units.
 *
 * Two units is enough to act on ("2 days 3 hours") without turning a bound
 * into a sentence, and the sign is dropped so the caller decides whether the
 * duration reads as elapsed or remaining.
 */
export function formatDuration(seconds: string): string {
  let remaining = BigInt(seconds);
  if (remaining < 0n) remaining = -remaining;
  if (remaining === 0n) return "0 seconds";

  const parts: string[] = [];

  for (const [size, label] of UNITS) {
    if (parts.length === 2) break;
    const count = remaining / size;
    if (count === 0n) continue;
    remaining -= count * size;
    parts.push(`${count} ${label}${count === 1n ? "" : "s"}`);
  }

  return parts.join(" ");
}

/** Turns a signed second offset into "in 2 hours" / "2 hours ago". */
export function formatRelativeSeconds(deltaSeconds: string): string {
  const delta = BigInt(deltaSeconds);
  if (delta === 0n) return "right now";
  return delta > 0n ? `in ${formatDuration(deltaSeconds)}` : `${formatDuration(deltaSeconds)} ago`;
}

/** Combines the absolute date with its distance from the reference clock. */
export function formatTimeBound(seconds: string, deltaSeconds: string | null): string {
  const absolute = formatUnixSeconds(seconds);
  if (deltaSeconds === null) return absolute;
  return `${absolute} (${formatRelativeSeconds(deltaSeconds)})`;
}

export function formatLedgerBound(ledger: number): string {
  return ledger === 0 ? "Unbounded" : `#${ledger.toLocaleString("en-US")}`;
}

/** Describes where the current ledger sits relative to a declared bound. */
export function formatLedgerDistance(ledgers: number | null): string {
  if (ledgers === null) return "Unbounded";
  if (ledgers === 0) return "This ledger";
  const count = Math.abs(ledgers);
  const plural = count === 1 ? "ledger" : "ledgers";
  return ledgers > 0 ? `${count} ${plural} away` : `${count} ${plural} ago`;
}

/** A declared ledger bound, with where the current ledger sits relative to it. */
export function formatLedgerBoundAt(ledger: number, distance: number | null): string {
  const absolute = formatLedgerBound(ledger);
  if (ledger === 0 || distance === null) return absolute;
  return `${absolute} (${formatLedgerDistance(distance)})`;
}

/** Badge tone for a single bound, so the JSX does not carry the mapping. */
export function boundStatusTone(status: BoundStatus): NonNullable<BadgeProps["tone"]> {
  if (status === "satisfied") return "success";
  if (status === "unknown") return "info";
  return "warning";
}

export function verdictTone(verdict: Verdict): StatusType {
  if (verdict === "satisfiable") return "success";
  if (verdict === "expired") return "error";
  return "warning";
}

/** Formats an ISO timestamp the same way as a decoded bound, for one reading style. */
export function formatIsoTimestamp(iso: string): string {
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return iso;
  return formatUnixSeconds(String(Math.floor(parsed / 1000)));
}
