import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/payment-qr/copy";
import { formatAmount, formatAsset } from "@/features/payment-qr/lib/format";
import type { PaymentRequest, PaymentUriResult } from "@/features/payment-qr/types";

export function PaymentQrResult({
  request,
  result
}: {
  request: PaymentRequest;
  result: PaymentUriResult;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
        </CardHeader>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div
            role="img"
            aria-label={copy.qrAlt}
            className="mx-auto w-full max-w-[18rem] shrink-0 rounded-lg border border-[#c7d6e8] bg-white p-3 [&_svg]:h-auto [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: result.svg }}
          />

          <div className="min-w-0 flex-1">
            <DataList
              items={[
                { label: "Destination", value: <CopyableValue label="destination" value={request.destination} /> },
                { label: "Amount", value: formatAmount(request.amount), mono: true },
                { label: "Asset", value: formatAsset(request.asset), mono: request.asset.kind === "issued" },
                ...(request.memo ? [{ label: "Memo", value: request.memo }] : []),
                ...(request.msg ? [{ label: "Message", value: request.msg }] : [])
              ]}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.uriLabel}</CardTitle>
        </CardHeader>
        <CopyableValue label="payment URI" value={result.uri} full className="break-all" />
      </Card>

      <StatusMessage type="info" title={copy.disclaimer} />
    </div>
  );
}
