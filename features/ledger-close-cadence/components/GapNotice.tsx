"use client";

import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/ledger-close-cadence/copy";
import type { LedgerCloseCadenceResult } from "@/features/ledger-close-cadence/types";

export function GapNotice({ result }: { result: LedgerCloseCadenceResult }) {
  const hasGaps = result.sequenceGaps.length > 0;
  const hasUnusual = result.intervals.some((interval) => interval.unusual);

  return (
    <div className="space-y-3">
      <StatusMessage type="info" title={copy.noticesTitle} description={copy.gapNotice} />

      {hasUnusual ? <p className="text-sm text-[#68758a]">{copy.unusualNotice}</p> : null}

      {hasGaps ? (
        <ul className="space-y-2">
          {result.sequenceGaps.map((gap) => (
            <li
              key={`${gap.afterSequence}-${gap.beforeSequence}`}
              className="rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-sm"
            >
              <span className="font-mono text-xs text-[#8a98aa]">
                #{gap.afterSequence} → #{gap.beforeSequence}
              </span>
              <span className="ml-2 text-[#29364d]">
                {copy.missingCountLabel}: {gap.missingCount}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#68758a]">{copy.noGaps}</p>
      )}
    </div>
  );
}
