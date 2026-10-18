"use client";

import { copy } from "@/features/soroban-footprint-diff/copy";
import { summarizeResources } from "@/features/soroban-footprint-diff/lib/resource-summary";
import type { ResourceSummaryData } from "@/features/soroban-footprint-diff/types";

export function ResourceSummary({
  first,
  second
}: {
  first: ResourceSummaryData;
  second: ResourceSummaryData;
}) {
  const firstRows = summarizeResources(first);
  const secondRows = summarizeResources(second);

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#68758a]">{copy.simulationNote}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <section>
          <h3 className="mb-2 text-sm font-bold text-[#172033]">{copy.firstResourcesLabel}</h3>
          {firstRows.hasAny ? (
            <ul className="space-y-1 text-xs text-[#4e5c73]">
              {firstRows.rows.map((row) => (
                <li key={row.label}>
                  {row.label}: <span className="font-mono">{row.value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#68758a]">No resource fields present.</p>
          )}
        </section>
        <section>
          <h3 className="mb-2 text-sm font-bold text-[#172033]">{copy.secondResourcesLabel}</h3>
          {secondRows.hasAny ? (
            <ul className="space-y-1 text-xs text-[#4e5c73]">
              {secondRows.rows.map((row) => (
                <li key={row.label}>
                  {row.label}: <span className="font-mono">{row.value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#68758a]">No resource fields present.</p>
          )}
        </section>
      </div>
    </div>
  );
}
