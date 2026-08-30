import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { Badge } from "@/core/ui/Badge";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { copy, flagCopy } from "@/features/asset-statistics/copy";
import { formatAmount, formatInteger } from "@/features/asset-statistics/lib/format";
import type {
  AssetStatisticsResult as AssetStatisticsResultValue,
  IssuerFlagKey
} from "@/features/asset-statistics/types";

const FLAG_KEYS: IssuerFlagKey[] = [
  "authRequired",
  "authRevocable",
  "authImmutable",
  "authClawbackEnabled"
];

export function AssetStatisticsResult({ result }: { result: AssetStatisticsResultValue }) {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: copy.assetLabel, value: result.assetCode, mono: true },
            {
              label: copy.issuerLabel,
              value: (
                <CopyableValue
                  label={copy.issuerValueLabel}
                  value={result.issuerId}
                  visible={8}
                />
              )
            }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.supplyTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.circulatingSupplyLabel,
              value: formatAmount(result.circulatingSupply),
              mono: true
            },
            {
              label: copy.accountBalancesLabel,
              value: formatAmount(result.accountBalances.total),
              mono: true
            },
            {
              label: copy.claimableBalancesLabel(result.claimableBalances.count),
              value: formatAmount(result.claimableBalances.amount),
              mono: true
            },
            {
              label: copy.liquidityPoolsLabel(result.liquidityPools.count),
              value: formatAmount(result.liquidityPools.amount),
              mono: true
            },
            {
              label: copy.contractsLabel(result.contracts.count),
              value: formatAmount(result.contracts.amount),
              mono: true
            }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.trustlinesTitle}</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <caption className="sr-only">{copy.trustlinesCaption}</caption>
            <thead>
              <tr className="border-b border-[#e3ebf5]">
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.authorizationColumn}
                </th>
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.holdersColumn}
                </th>
                <th scope="col" className="py-2 font-bold text-[#4e5c73]">
                  {copy.balanceColumn}
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [copy.authorizedLabel, result.holders.authorized, result.accountBalances.authorized],
                [
                  copy.liabilitiesOnlyLabel,
                  result.holders.liabilitiesOnly,
                  result.accountBalances.liabilitiesOnly
                ],
                [
                  copy.unauthorizedLabel,
                  result.holders.unauthorized,
                  result.accountBalances.unauthorized
                ],
                [copy.allAccountsLabel, result.holders.total, result.accountBalances.total]
              ].map(([label, holders, balance]) => (
                <tr key={String(label)} className="border-b border-[#f0f4f9] last:border-0">
                  <th scope="row" className="py-3 pr-4 font-semibold text-[#172033]">
                    {label}
                  </th>
                  <td className="py-3 pr-4 font-mono text-[#172033]">
                    {formatInteger(holders as number)}
                  </td>
                  <td className="py-3 font-mono text-[#172033]">
                    {formatAmount(balance as string)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.flagsTitle}</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
            <caption className="sr-only">{copy.flagsCaption}</caption>
            <thead>
              <tr className="border-b border-[#e3ebf5]">
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.flagColumn}
                </th>
                <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                  {copy.stateColumn}
                </th>
                <th scope="col" className="py-2 font-bold text-[#4e5c73]">
                  {copy.meaningColumn}
                </th>
              </tr>
            </thead>
            <tbody>
              {FLAG_KEYS.map((key) => {
                const enabled = result.flags[key];
                return (
                  <tr key={key} className="border-b border-[#f0f4f9] last:border-0">
                    <th scope="row" className="py-3 pr-4 font-mono font-semibold text-[#172033]">
                      {flagCopy[key].label}
                    </th>
                    <td className="py-3 pr-4">
                      <Badge tone={enabled ? "success" : "muted"}>
                        {enabled ? copy.enabled : copy.disabled}
                      </Badge>
                    </td>
                    <td className="py-3 text-[#4e5c73]">{flagCopy[key].meaning}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
