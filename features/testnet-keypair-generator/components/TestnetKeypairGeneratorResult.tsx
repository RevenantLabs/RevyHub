import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/testnet-keypair-generator/copy";
import { formatSummary } from "@/features/testnet-keypair-generator/lib/format";
import type { TestnetKeypairGeneratorResult as TestnetKeypairGeneratorResultValue } from "@/features/testnet-keypair-generator/types";

export function TestnetKeypairGeneratorResult({ result }: { result: TestnetKeypairGeneratorResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList items={[{ label: "Summary", value: formatSummary(result.summary) }]} />
    </Card>
  );
}
