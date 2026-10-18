"use client";

import { copy } from "@/features/ledger-protocol-transition-map/copy";
import { formatTransitionLabel } from "@/features/ledger-protocol-transition-map/lib/format";
import type { ProtocolTransition } from "@/features/ledger-protocol-transition-map/types";

export function TransitionRows({ transitions }: { transitions: ProtocolTransition[] }) {
  if (transitions.length === 0) {
    return <p className="text-sm text-[#68758a]">{copy.noTransitions}</p>;
  }

  return (
    <ol className="space-y-2">
      {transitions.map((transition) => (
        <li
          key={`${transition.beforeSequence}-${transition.afterSequence}`}
          className="rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-sm"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[#172033]">{formatTransitionLabel(transition)}</span>
            <span
              className={
                transition.certainty === "exact"
                  ? "rounded bg-[#e8f8ef] px-2 py-0.5 text-xs text-[#1b6b3a]"
                  : "rounded bg-[#fff4e5] px-2 py-0.5 text-xs text-[#9a5b00]"
              }
            >
              {transition.certainty === "exact" ? copy.exactBadge : copy.uncertainBadge}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
