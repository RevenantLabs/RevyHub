import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/asset-statistics/copy";
import { formatAmount } from "@/features/asset-statistics/lib/format";
import type { AssetStatisticsResult as ResultType } from "@/features/asset-statistics/types";

export function AssetStatisticsResult({ result }: { result: ResultType }) {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>{copy.supplyTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: "Circulating Supply", value: formatAmount(result.supply), mono: true },
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.holdersTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: "Authorized", value: result.accounts.authorized.toLocaleString() },
            { label: "Authorized to maintain liabilities", value: result.accounts.authorizedToMaintainLiabilities.toLocaleString() },
            { label: "Unauthorized", value: result.accounts.unauthorized.toLocaleString() },
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.claimableBalancesTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: "Amount in claimable balances", value: formatAmount(result.claimableBalancesAmount), mono: true },
            { label: "Number of claimable balances", value: result.numClaimableBalances.toLocaleString() },
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.flagsTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: "Authorization Required", value: result.flags.authRequired ? "Yes" : "No" },
            { label: "Authorization Revocable", value: result.flags.authRevocable ? "Yes" : "No" },
            { label: "Authorization Immutable", value: result.flags.authImmutable ? "Yes" : "No" },
            { label: "Clawback Enabled", value: result.flags.clawbackEnabled ? "Yes" : "No" },
          ]}
        />
      </Card>
    </div>
  );
}
