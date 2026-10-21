import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/txrep-converter/copy";
import { formatFieldCount } from "@/features/txrep-converter/lib/format";
import type { TxrepConverterResult as ResultValue } from "@/features/txrep-converter/types";
import { ConversionOutput } from "@/features/txrep-converter/components/ConversionOutput";
import { DetectedFormatBadge } from "@/features/txrep-converter/components/DetectedFormatBadge";
import { RoundTripWarning } from "@/features/txrep-converter/components/RoundTripWarning";

export function TxrepConverterResult({ result }: { result: ResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <DetectedFormatBadge format={result.detected} />
        <RoundTripWarning matched={result.roundTripMatched} />
        <DataList items={[{ label: copy.fieldCountLabel, value: formatFieldCount(result.fieldCount) }]} />
        {result.roundTripMatched ? <ConversionOutput value={result.output} format={result.outputFormat} /> : null}
      </div>
    </Card>
  );
}
