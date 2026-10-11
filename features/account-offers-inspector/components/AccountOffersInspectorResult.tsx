import { Card } from "@/core/ui/Card";
import { copy } from "@/features/account-offers-inspector/copy";
import { formatAssetDisplay, formatPrice, formatTimestamp } from "@/features/account-offers-inspector/lib/format";
import type { AccountOffersResult } from "@/features/account-offers-inspector/types";

interface Props {
  result: AccountOffersResult;
}

export function AccountOffersInspectorResult({ result }: Props) {
  if (result.offers.length === 0) {
    return (
      <Card>
        <h3 className="text-base font-semibold text-[#172033]">{copy.noOffersTitle}</h3>
        <p className="mt-1 text-sm text-[#68758a]">{copy.noOffersDescription}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-[#172033]">
        {copy.resultTitle} ({result.offers.length})
      </h3>
      {result.offers.map((offer) => (
        <Card key={offer.id}>
          <div className="space-y-2">
            <div className="text-xs text-[#68758a] font-mono">#{offer.id}</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-[#68758a]">{copy.columnSelling}: </span>
                <span className="text-[#172033]">{formatAssetDisplay(offer.sellingAsset)} × {offer.amount}</span>
              </div>
              <div>
                <span className="text-[#68758a]">{copy.columnBuying}: </span>
                <span className="text-[#172033]">{formatAssetDisplay(offer.buyingAsset)}</span>
              </div>
              <div>
                <span className="text-[#68758a]">{copy.columnPrice}: </span>
                <span className="text-[#172033]">{formatPrice(offer.priceN, offer.priceD)}</span>
              </div>
              <div>
                <span className="text-[#68758a]">{copy.lastModified}: </span>
                <span className="text-[#172033]">{formatTimestamp(offer.lastModifiedTime)}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
