"use client";

import { formatRunLabel } from "@/features/ledger-protocol-transition-map/lib/format";
import type { ProtocolRun } from "@/features/ledger-protocol-transition-map/types";

export function ProtocolRuns({ runs }: { runs: ProtocolRun[] }) {
  return (
    <ol className="space-y-2">
      {runs.map((run) => (
        <li
          key={`${run.protocolVersion}-${run.startSequence}-${run.endSequence}`}
          className="rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-sm text-[#172033]"
        >
          {formatRunLabel(run)}
        </li>
      ))}
    </ol>
  );
}
