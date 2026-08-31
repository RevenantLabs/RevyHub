import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/liquidity-pool-calculator/copy";
import { formatBps } from "@/features/liquidity-pool-calculator/lib/format";
import type { LiquidityPoolCalculatorResult as ResultValue } from "@/features/liquidity-pool-calculator/types";

export function LiquidityPoolCalculatorResult({ result }: { result: ResultValue }) {
  return (
    <div className="space-y-4">
      {result.firstDeposit ? <StatusMessage type="info" title={copy.firstDeposit} description={result.detail} /> : null}
      {result.materiallyMovesPool ? <StatusMessage type="warning" title={copy.materialWarning} description={result.detail} /> : null}
      <Card>
        <CardHeader><CardTitle>{result.action === "deposit" ? copy.depositTitle : copy.withdrawTitle}</CardTitle></CardHeader>
        <DataList items={[
          { label: copy.reserveRatio, value: result.currentPrice?.display ?? copy.notAvailable, mono: true },
          { label: copy.priceLowerBound, value: result.priceLowerBound.display, mono: true },
          { label: copy.priceUpperBound, value: result.priceUpperBound.display, mono: true },
          { label: copy.fee, value: String(result.feeBp), mono: true },
          { label: copy.network, value: result.network }
        ]} />
      </Card>
      <Card>
        <DataList items={result.action === "deposit" ? [
          { label: copy.mintedShares, value: result.mintedShares ?? copy.notAvailable, mono: true },
          { label: copy.consumedA, value: result.consumedA ?? copy.notAvailable, mono: true },
          { label: copy.consumedB, value: result.consumedB ?? copy.notAvailable, mono: true },
          { label: copy.minimumA, value: result.minimumA ?? copy.notAvailable, mono: true },
          { label: copy.minimumB, value: result.minimumB ?? copy.notAvailable, mono: true },
          { label: copy.priceImpact, value: formatBps(result.priceImpactBps) }
        ] : [
          { label: copy.withdrawnA, value: result.withdrawnA ?? copy.notAvailable, mono: true },
          { label: copy.withdrawnB, value: result.withdrawnB ?? copy.notAvailable, mono: true },
          { label: copy.minimumA, value: result.minimumA ?? copy.notAvailable, mono: true },
          { label: copy.minimumB, value: result.minimumB ?? copy.notAvailable, mono: true }
        ]} />
        {!result.firstDeposit && !result.materiallyMovesPool ? <p className="mt-3 text-sm text-[#68758a]">{result.detail}</p> : null}
      </Card>
    </div>
  );
}
