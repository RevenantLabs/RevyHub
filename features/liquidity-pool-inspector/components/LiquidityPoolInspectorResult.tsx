import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/liquidity-pool-inspector/copy";
import {
  formatAssetLabel,
  formatFeeBasisPoints,
  formatPricePair
} from "@/features/liquidity-pool-inspector/lib/format";
import type { LiquidityPoolInspectorResult } from "@/features/liquidity-pool-inspector/types";

export function LiquidityPoolInspectorResult({ result }: { result: LiquidityPoolInspectorResult }) {
  const [reserveA, reserveB] = result.reserves;
  const assetA = formatAssetLabel(reserveA);
  const assetB = formatAssetLabel(reserveB);
  const prices = formatPricePair(assetA, assetB, result.priceAToB, result.priceBToA);
  const participantLabel =
    result.participantSource === "num_pool_members"
      ? copy.participantsMembers
      : copy.participantsTrustlines;

  return (
    <div className="space-y-4">
      <StatusMessage type="success" title={copy.resultTitle} />

      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: "Pool ID",
              value: <CopyableValue label="pool id" value={result.poolId} visible={8} />
            },
            { label: "Fee", value: formatFeeBasisPoints(result.feeBp) },
            { label: "Total shares", value: result.totalShares, mono: true },
            { label: participantLabel, value: String(result.participantCount), mono: true }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.reservesTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: assetA, value: reserveA.amount, mono: true },
            { label: assetB, value: reserveB.amount, mono: true }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.pricingTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: `${assetA} → ${assetB}`, value: prices.aToB, mono: true },
            { label: `${assetB} → ${assetA}`, value: prices.bToA, mono: true }
          ]}
        />
        <p className="mt-3 text-sm text-[#68758a]">{copy.pricePrecisionNote(result.pricePrecision)}</p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.shareValueTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: assetA, value: result.shareValueA, mono: true },
            { label: assetB, value: result.shareValueB, mono: true }
          ]}
        />
      </Card>
    </div>
  );
}
