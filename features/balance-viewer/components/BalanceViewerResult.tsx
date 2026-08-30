"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { Badge } from "@/core/ui/Badge";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/balance-viewer/copy";
import {
  balanceMatchesFilter,
  formatAmount,
  formatAssetLabel,
  totalLiabilities
} from "@/features/balance-viewer/lib/format";
import type { AccountBalances } from "@/features/balance-viewer/types";

export function BalanceViewerResult({ data }: { data: AccountBalances }) {
  const [filter, setFilter] = useState("");

  const visibleBalances = useMemo(
    () => data.balances.filter((balance) => balanceMatchesFilter(balance, filter)),
    [data.balances, filter]
  );

  if (!data.balances.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{copy.noBalancesTitle}</CardTitle>
        </CardHeader>
        <p className="text-sm leading-6 text-[#4e5c73]">{copy.noBalancesDescription}</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>

      <div className="mb-4">
        <Field label={copy.filterLabel} hint={copy.filterHint}>
          {({ inputId, describedBy }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder={copy.filterPlaceholder}
              autoComplete="off"
              spellCheck={false}
            />
          )}
        </Field>
      </div>

      {visibleBalances.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Balances held by account {data.accountId}
            </caption>
            <thead>
              <tr className="border-b border-[#e3ebf5]">
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">{copy.columnAsset}</th>
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">{copy.columnBalance}</th>
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">{copy.columnIssuer}</th>
                <th scope="col" className="py-2 font-bold text-[#4e5c73]">{copy.columnLiabilities}</th>
              </tr>
            </thead>
            <tbody>
              {visibleBalances.map((balance) => (
                <tr
                  key={`${balance.kind}-${balance.assetCode}-${balance.issuer ?? "native"}`}
                  className="border-b border-[#f0f4f9] last:border-0"
                >
                  <th scope="row" className="py-3 pr-4 font-semibold text-[#172033]">
                    <span className="flex items-center gap-2">
                      {formatAssetLabel(balance)}
                      {balance.authorized === false ? <Badge tone="warning">unauthorized</Badge> : null}
                    </span>
                  </th>
                  <td className="py-3 pr-4 font-mono text-[#172033]">{formatAmount(balance.balance)}</td>
                  <td className="py-3 pr-4">
                    {balance.issuer ? (
                      <CopyableValue label={`${balance.assetCode} issuer`} value={balance.issuer} visible={4} />
                    ) : (
                      <span className="text-[#8a98aa]">—</span>
                    )}
                  </td>
                  <td className="py-3 font-mono text-[#4e5c73]">
                    {totalLiabilities(balance) ?? <span className="font-sans text-[#8a98aa]">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-md border border-[#e3ebf5] bg-[#f8fafc] px-4 py-3 text-sm text-[#4e5c73]">
          <p className="font-semibold text-[#172033]">{copy.filterEmptyTitle}</p>
          <p className="mt-1">{copy.filterEmptyDescription}</p>
        </div>
      )}

      <p className="mt-4 text-xs text-[#68758a]">
        {visibleBalances.length} of {data.balances.length} balance line
        {data.balances.length === 1 ? "" : "s"} shown · {data.subentryCount} subentr
        {data.subentryCount === 1 ? "y" : "ies"}
      </p>
    </Card>
  );
}
