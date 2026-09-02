import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/scval-codec/copy";
import type { ScvalCodecResult as ScvalCodecResultValue } from "@/features/scval-codec/types";

export function ScvalCodecResult({ result }: { result: ScvalCodecResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <DataList
        items={[
          {
            label: result.mode === "decode" ? copy.decodedTitle : copy.encodedTitle,
            value: result.output
          }
        ]}
      />
    </Card>
  );
}
