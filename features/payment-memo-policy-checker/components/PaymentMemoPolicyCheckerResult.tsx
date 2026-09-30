import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/payment-memo-policy-checker/copy";
import { formatSummary } from "@/features/payment-memo-policy-checker/lib/format";
import type { PaymentMemoPolicyCheckerResult as PaymentMemoPolicyCheckerResultValue } from "@/features/payment-memo-policy-checker/types";

export function PaymentMemoPolicyCheckerResult({ result }: { result: PaymentMemoPolicyCheckerResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList items={[{ label: "Summary", value: formatSummary(result.summary) }]} />
    </Card>
  );
}
