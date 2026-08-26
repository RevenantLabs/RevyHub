import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/sponsored-reserves/copy";
import { formatSummary } from "@/features/sponsored-reserves/lib/format";
import type { SponsoredReservesResult as SponsoredReservesResultValue } from "@/features/sponsored-reserves/types";

export function SponsoredReservesResult({ result }: { result: SponsoredReservesResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList items={[{ label: "Summary", value: formatSummary(result.summary) }]} />
    </Card>
  );
}
