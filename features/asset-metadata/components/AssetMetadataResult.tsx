import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { Badge } from "@/core/ui/Badge";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/asset-metadata/copy";
import {
  declaredFields,
  formatFetchedAt,
  isUnpinned
} from "@/features/asset-metadata/lib/format";
import type { TomlResult } from "@/features/asset-metadata/types";

export function AssetMetadataResult({ result }: { result: TomlResult }) {
  return (
    <div className="space-y-4">
      <StatusMessage
        type="info"
        title={copy.trustWarningTitle}
        description={copy.trustWarningDescription}
      />

      {result.currencies.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{copy.noCurrenciesTitle}</CardTitle>
          </CardHeader>
          <p className="text-sm leading-6 text-[#4e5c73]">{copy.noCurrenciesDescription}</p>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{copy.resultTitle}</CardTitle>
          </CardHeader>

          <ul className="space-y-5">
            {result.currencies.map((currency, index) => (
              <li
                key={`${currency.code}-${currency.issuer ?? index}`}
                className="rounded-lg border border-[#e3ebf5] bg-white/60 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-[#172033]">{currency.code}</h3>
                  {isUnpinned(currency) ? (
                    <Badge tone="warning">{copy.unpinnedLabel}</Badge>
                  ) : null}
                </div>

                {currency.issuer ? (
                  <div className="mt-2">
                    <CopyableValue label={`${currency.code} issuer`} value={currency.issuer} />
                  </div>
                ) : null}

                <DataList className="mt-2" items={declaredFields(currency)} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{copy.provenanceTitle}</CardTitle>
        </CardHeader>
        <DataList
          items={[
            { label: copy.labelFetchUrl, value: result.fetchUrl, mono: true },
            { label: copy.labelFetchedAt, value: formatFetchedAt(result.fetchedAt) },
            { label: copy.labelCount, value: String(result.currencies.length) }
          ]}
        />
      </Card>
    </div>
  );
}
