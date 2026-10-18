import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/amount-converter/copy";
import { formatAmount, formatStroops } from "@/features/amount-converter/lib/format";
import type { AmountConverterResult as AmountConverterResultValue } from "@/features/amount-converter/types";

export function AmountConverterResult({ result }: { result: AmountConverterResultValue }) {
  return (
    <div className="space-y-4">
      <StatusMessage type="success" title={copy.exactConversion} />

      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.resultStroops,
              value: (
                <CopyableValue label="stroops" value={result.stroops} visible={12} />
              )
            },
            {
              label: "Formatted stroops",
              value: formatStroops(result.stroops)
            },
            {
              label: copy.resultAmount,
              value: <CopyableValue label="amount" value={result.amount} visible={12} />
            },
            {
              label: "Formatted amount",
              value: formatAmount(result.amount)
            }
          ]}
        />
      </Card>
    </div>
  );
}
