"use client";

import { copy } from "@/features/ledger-close-cadence/copy";
import { formatDurationMs } from "@/features/ledger-close-cadence/lib/format";
import type { LedgerInterval } from "@/features/ledger-close-cadence/types";

export function LedgerIntervals({ intervals }: { intervals: LedgerInterval[] }) {
  if (intervals.length === 0) {
    return <p className="text-sm text-[#68758a]">{copy.noIntervals}</p>;
  }

  return (
    <ol className="space-y-2">
      {intervals.map((interval) => (
        <li
          key={`${interval.fromSequence}-${interval.toSequence}`}
          className="rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-sm"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-xs text-[#8a98aa]">
              #{interval.fromSequence} → #{interval.toSequence}
            </span>
            <span className="font-semibold text-[#172033]">
              {formatDurationMs(interval.durationMs)}
            </span>
            {interval.unusual ? (
              <span className="rounded bg-[#fff4e5] px-2 py-0.5 text-xs text-[#9a5b00]">
                {copy.unusualBadge}
              </span>
            ) : null}
            {interval.repeatedTimestamp ? (
              <span className="rounded bg-[#eef2f8] px-2 py-0.5 text-xs text-[#4e5c73]">
                {copy.repeatedBadge}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-[#68758a]">
            {interval.fromClosedAt} → {interval.toClosedAt}
          </p>
        </li>
      ))}
    </ol>
  );
}
