import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList, type DataListItem } from "@/core/ui/DataList";
import { copy } from "@/features/sep38-quote-viewer/copy";
import { IndicativeOnlyNotice } from "@/features/sep38-quote-viewer/components/IndicativeOnlyNotice";
import { IndicativePrice } from "@/features/sep38-quote-viewer/components/IndicativePrice";
import { QuoteExpiration } from "@/features/sep38-quote-viewer/components/QuoteExpiration";
import { formatDecimalString, formatFee, formatNetwork } from "@/features/sep38-quote-viewer/lib/format";
import type { Sep38QuoteViewerResult as Sep38QuoteViewerResultValue } from "@/features/sep38-quote-viewer/types";

export function Sep38QuoteViewerResult({ result }: { result: Sep38QuoteViewerResultValue }) {
  const items: DataListItem[] = [
    { label: copy.domainLabel, value: result.homeDomain },
    { label: copy.quoteServerLabel, value: result.quoteServer, mono: true },
    { label: copy.sellAmountLabel, value: formatDecimalString(result.sellAmount) },
    { label: copy.networkLabel, value: formatNetwork(result.network) }
  ];

  if (result.quote.buyAmount) {
    items.push({
      label: copy.buyAmountLabel,
      value: formatDecimalString(result.quote.buyAmount)
    });
  }
  if (result.quote.feeTotal && result.quote.feeAsset) {
    items.push({
      label: copy.feeLabel,
      value: formatFee(result.quote.feeTotal, result.quote.feeAsset)
    });
  }

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
        <CardDescription>{result.summary}</CardDescription>
      </CardHeader>
      <div className="grid grid-cols-1 gap-4">
        <IndicativeOnlyNotice />
        <IndicativePrice
          price={result.quote.price}
          sellAsset={result.sellAsset}
          buyAsset={result.buyAsset}
          offChain={result.offChain}
          onChain={result.onChain}
        />
        <QuoteExpiration expiresAt={result.quote.expiresAt} />
        <DataList
          items={items.map((item) => ({
            ...item,
            value: <span className="break-all">{item.value}</span>
          }))}
        />
      </div>
    </Card>
  );
}
