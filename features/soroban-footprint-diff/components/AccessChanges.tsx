"use client";

import { copy } from "@/features/soroban-footprint-diff/copy";
import { formatChangeLine } from "@/features/soroban-footprint-diff/lib/format";
import type { AccessChange } from "@/features/soroban-footprint-diff/types";

export function AccessChanges({ changes }: { changes: AccessChange[] }) {
  if (changes.length === 0) {
    return <p className="text-sm text-[#68758a]">{copy.noModeChanges}</p>;
  }

  return (
    <ul className="space-y-2">
      {changes.map((change) => (
        <li
          key={`${change.id}-${change.kind}`}
          className="rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 font-mono text-xs text-[#172033]"
        >
          {formatChangeLine(change)}
        </li>
      ))}
    </ul>
  );
}
