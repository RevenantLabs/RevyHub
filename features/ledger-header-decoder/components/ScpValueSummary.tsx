import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/ledger-header-decoder/copy";
import { formatCloseTime } from "@/features/ledger-header-decoder/lib/format";
import type { ScpValueSummary as ScpValueSummaryValue } from "@/features/ledger-header-decoder/types";

export function ScpValueSummary({ value }: { value: ScpValueSummaryValue }) {
  return <Card>
    <CardHeader><CardTitle>{copy.scpTitle}</CardTitle></CardHeader>
    <DataList items={[
      { label: copy.txSetHash, value: value.txSetHash, mono: true },
      { label: copy.closeTime, value: formatCloseTime(value.closeTime) }
    ]} />
  </Card>;
}
