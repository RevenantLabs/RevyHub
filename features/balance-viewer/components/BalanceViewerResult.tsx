import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { Badge } from "@/core/ui/Badge";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { copy } from "@/features/balance-viewer/copy";
import { formatAmount, formatAssetLabel, totalLiabilities } from "@/features/balance-viewer/lib/format";
import type { AccountBalances } from "@/features/balance-viewer/types";

export function BalanceViewerResult({ data }: { data: AccountBalances }) {
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
            {data.balances.map((balance) => (
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

      <p className="mt-4 text-xs text-[#68758a]">
        {data.balances.length} balance line{data.balances.length === 1 ? "" : "s"} ·{" "}
        {data.subentryCount} subentr{data.subentryCount === 1 ? "y" : "ies"}
      </p>
    </Card>
  );
}
