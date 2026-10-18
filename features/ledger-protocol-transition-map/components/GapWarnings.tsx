"use client";

import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/ledger-protocol-transition-map/copy";
import type { LedgerProtocolTransitionMapResult } from "@/features/ledger-protocol-transition-map/types";

export function GapWarnings({ result }: { result: LedgerProtocolTransitionMapResult }) {
  return (
    <div className="space-y-3">
      {result.partialPage ? (
        <StatusMessage type="warning" title={copy.gapsTitle} description={copy.partialPageNotice} />
      ) : (
        <StatusMessage type="info" title={copy.gapsTitle} description={copy.gapNotice} />
      )}

      {result.gaps.length > 0 ? (
        <ul className="space-y-2">
          {result.gaps.map((gap) => (
            <li
              key={`${gap.afterSequence}-${gap.beforeSequence}`}
              className="rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 font-mono text-xs text-[#4e5c73]"
            >
              #{gap.afterSequence} → #{gap.beforeSequence} · missing {gap.missingCount}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#68758a]">{copy.noGaps}</p>
      )}
    </div>
  );
}
