import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/reserve-calculator/copy";
import { formatAmount, formatLedger } from "@/features/reserve-calculator/lib/format";
import type { ReserveCalculatorResult as ReserveCalculatorResultValue } from "@/features/reserve-calculator/types";

export function ReserveCalculatorResult({ data }: { data: ReserveCalculatorResultValue }) {
  const ledger = formatLedger(data.ledgerSequence);

  return (
    <div className="space-y-5">
      {data.belowMinimum ? (
        <StatusMessage
          type="warning"
          title={copy.belowMinimumTitle}
          description={copy.belowMinimumDescription(data.minimumBalanceShortfall)}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: copy.spendableLabel, value: formatAmount(data.spendableBalance), mono: true },
            { label: copy.minimumBalanceLabel, value: formatAmount(data.minimumBalance), mono: true },
            { label: copy.nativeBalanceLabel, value: formatAmount(data.nativeBalance), mono: true },
            { label: copy.sellingLiabilitiesLabel, value: formatAmount(data.sellingLiabilities), mono: true },
            { label: copy.baseReserveLabel, value: formatAmount(data.baseReserve), mono: true },
            { label: copy.sourceLedgerLabel, value: ledger, mono: true }
          ]}
        />
        <p className="mt-4 text-xs text-[#68758a]">{copy.sourceNote(ledger)}</p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.breakdownTitle}</CardTitle>
          <CardDescription>{copy.breakdownDescription}</CardDescription>
        </CardHeader>
        <DataList
          items={[
            { label: copy.baseAccountLabel, value: formatAmount(data.breakdown.baseAccount), mono: true },
            { label: copy.subentriesLabel(data.subentryCount), value: formatAmount(data.breakdown.subentries), mono: true },
            { label: copy.sponsoringLabel(data.numSponsoring), value: formatAmount(data.breakdown.sponsoring), mono: true },
            { label: copy.sponsoredLabel(data.numSponsored), value: formatAmount(data.breakdown.sponsored), mono: true }
          ]}
        />
      </Card>
    </div>
  );
}
