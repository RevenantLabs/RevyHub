import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/muxed-account-codec/copy";
import { formatHexMuxedId, formatMuxedId } from "@/features/muxed-account-codec/lib/format";
import type { MuxedAccountCodecResult as ResultType } from "@/features/muxed-account-codec/types";

export function MuxedAccountCodecResult({ result }: { result: ResultType }) {
  return (
    <div className="space-y-4">
      <StatusMessage
        type="success"
        title={result.mode === "decode" ? copy.resultSummaryDecode : copy.resultSummaryEncode}
      />

      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            {
              label: copy.resultMuxedAddress,
              value: <CopyableValue label="multiplexed address" value={result.muxedAddress} full />
            },
            {
              label: copy.resultBaseAddress,
              value: <CopyableValue label="base address" value={result.baseAddress} full />
            },
            {
              label: copy.resultIdDecimal,
              value: <CopyableValue label="multiplexing id" value={result.id} full />
            },
            {
              label: copy.resultIdFormatted,
              value: formatMuxedId(result.id),
              mono: true
            },
            {
              label: copy.resultIdHex,
              value: formatHexMuxedId(result.id),
              mono: true
            }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.explanationTitle}</CardTitle>
        </CardHeader>
        <p className="p-4 pt-0 text-sm leading-6 text-[#4e5c73]">
          {copy.explanationText}
        </p>
      </Card>
    </div>
  );
}
