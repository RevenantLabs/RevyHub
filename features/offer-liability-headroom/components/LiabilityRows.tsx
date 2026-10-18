"use client";

import { copy } from "@/features/offer-liability-headroom/copy";
import { formatAssetLabel } from "@/features/offer-liability-headroom/lib/format";
import type { BalanceLiabilityRow } from "@/features/offer-liability-headroom/types";

export function LiabilityRows({ rows }: { rows: BalanceLiabilityRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-[#68758a]">{copy.noBalances}</p>;
  }

  return (
    <ol className="space-y-2">
      {rows.map((row) => (
        <li
          key={row.asset.key}
          className="rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-sm"
        >
          <p className="font-semibold text-[#172033]">{formatAssetLabel(row.asset)}</p>
          <div className="mt-1 grid gap-1 text-xs text-[#4e5c73] sm:grid-cols-2">
            <div>
              {copy.balanceLabel}: <span className="font-mono">{row.balance}</span>
            </div>
            <div>
              {copy.sellingLiabilitiesLabel}:{" "}
              <span className="font-mono">{row.sellingLiabilities}</span>
            </div>
            <div>
              {copy.buyingLiabilitiesLabel}:{" "}
              <span className="font-mono">{row.buyingLiabilities}</span>
            </div>
            <div>
              {copy.limitLabel}:{" "}
              <span className="font-mono">{row.limit ?? "—"}</span>
            </div>
            <div className="sm:col-span-2">
              {copy.availableLabel}:{" "}
              <span className="font-mono">{row.availableToSellEstimate ?? "—"}</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
