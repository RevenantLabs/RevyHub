"use client";

import { copy } from "@/features/soroban-footprint-diff/copy";
import { formatKeyLabel } from "@/features/soroban-footprint-diff/lib/format";
import type { FootprintKey } from "@/features/soroban-footprint-diff/types";

export function FootprintGroups({
  added,
  removed
}: {
  added: FootprintKey[];
  removed: FootprintKey[];
}) {
  return (
    <div className="space-y-4">
      <section>
        <h3 className="mb-2 text-sm font-bold text-[#172033]">{copy.addedTitle}</h3>
        {added.length === 0 ? (
          <p className="text-sm text-[#68758a]">{copy.noAdded}</p>
        ) : (
          <ul className="space-y-1">
            {added.map((key) => (
              <li key={key.id} className="font-mono text-xs text-[#29364d]">
                {formatKeyLabel(key)}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h3 className="mb-2 text-sm font-bold text-[#172033]">{copy.removedTitle}</h3>
        {removed.length === 0 ? (
          <p className="text-sm text-[#68758a]">{copy.noRemoved}</p>
        ) : (
          <ul className="space-y-1">
            {removed.map((key) => (
              <li key={key.id} className="font-mono text-xs text-[#29364d]">
                {formatKeyLabel(key)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
