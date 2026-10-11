"use client";

import { Badge } from "@/core/ui/Badge";
import { Button } from "@/core/ui/Button";
import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/offer-inspector/copy";
import {
  formatAmount,
  formatAsset,
  formatPrice
} from "@/features/offer-inspector/lib/format";
import type { OfferInspectorResult as OfferInspectorResultValue } from "@/features/offer-inspector/types";

export function OfferInspectorResult({
  result,
  onLoadMore,
  loadingMore = false
}: {
  result: OfferInspectorResultValue;
  onLoadMore?: () => void;
  loadingMore?: boolean;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{copy.resultTitle}</CardTitle>
          <Badge tone={result.isPartial ? "warning" : "success"}>
            {result.isPartial ? copy.partialBadge : copy.completeBadge}
          </Badge>
        </CardHeader>

        <div className="space-y-4">
          <DataList
            items={[
              {
                label: "Account ID",
                value: (
                  <CopyableValue
                    label="account address"
                    value={result.accountId}
                    visible={8}
                  />
                )
              },
              {
                label: copy.baseReserveLabel,
                value: `${result.baseReserveXlm} XLM (${result.baseReserveInStroops} stroops)`
              },
              {
                label: copy.offersCount,
                value: `${result.loadedOffersCount}`
              },
              {
                label: copy.grossReserveLabel,
                value: `${result.grossReserveXlm} XLM (${result.grossReserveUnits} subentr${result.grossReserveUnits === 1 ? "y" : "ies"})`
              },
              {
                label: "Latest Ledger",
                value: `${result.latestLedgerSequence}`
              }
            ]}
          />

          <div className="rounded-md border border-[#e3ebf5] bg-[#f8fafc] p-4 text-xs text-[#4e5c73] space-y-2">
            <p>{copy.sponsorshipNotice}</p>
            {result.isPartial ? (
              <p className="font-semibold text-[#9a513f]">{copy.partialWarning}</p>
            ) : null}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {copy.tableAriaLabel} ({result.offers.length})
          </CardTitle>
        </CardHeader>

        {result.offers.length === 0 ? (
          <div className="rounded-md border border-[#e3ebf5] bg-[#f8fafc] px-4 py-6 text-center text-sm text-[#4e5c73]">
            <p className="font-bold text-[#172033]">{copy.noOffersTitle}</p>
            <p className="mt-1">{copy.noOffersDescription}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
                <caption className="sr-only">
                  Open offers for account {result.accountId}
                </caption>
                <thead>
                  <tr className="border-b border-[#e3ebf5]">
                    <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                      {copy.columnOfferId}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                      {copy.columnSelling}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                      {copy.columnBuying}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                      {copy.columnAmount}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                      {copy.columnPrice}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-bold text-[#4e5c73]">
                      {copy.columnSponsor}
                    </th>
                    <th scope="col" className="py-2 font-bold text-[#4e5c73]">
                      {copy.columnLedger}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.offers.map((offer) => (
                    <tr
                      key={offer.id}
                      className="border-b border-[#f0f4f9] last:border-0"
                    >
                      <th
                        scope="row"
                        className="py-3 pr-4 font-mono text-xs font-semibold text-[#172033]"
                      >
                        {offer.id}
                      </th>
                      <td className="py-3 pr-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-[#172033]">
                            {formatAsset(offer.selling)}
                          </span>
                          {!offer.selling.isNative && offer.selling.issuer ? (
                            <CopyableValue
                              label="selling issuer"
                              value={offer.selling.issuer}
                              visible={4}
                            />
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-[#172033]">
                            {formatAsset(offer.buying)}
                          </span>
                          {!offer.buying.isNative && offer.buying.issuer ? (
                            <CopyableValue
                              label="buying issuer"
                              value={offer.buying.issuer}
                              visible={4}
                            />
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-mono text-[#172033]">
                        {formatAmount(offer.amount)}
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-[#172033]">
                        {formatPrice(offer.price, offer.priceFraction)}
                      </td>
                      <td className="py-3 pr-4">
                        {offer.sponsor ? (
                          <CopyableValue
                            label="sponsor"
                            value={offer.sponsor}
                            visible={4}
                          />
                        ) : (
                          <span className="text-[#8a98aa]">—</span>
                        )}
                      </td>
                      <td className="py-3 font-mono text-xs text-[#4e5c73]">
                        {offer.lastModifiedLedger}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {result.isPartial && onLoadMore ? (
              <div className="pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? copy.loadingMore : copy.loadMore}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  );
}

