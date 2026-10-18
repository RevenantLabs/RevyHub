"use client";

import { copy } from "@/features/offer-liability-headroom/copy";
import { formatOfferLine, formatPrice } from "@/features/offer-liability-headroom/lib/format";
import type { OfferRow } from "@/features/offer-liability-headroom/types";

export function OfferRows({ offers }: { offers: OfferRow[] }) {
  if (offers.length === 0) {
    return <p className="text-sm text-[#68758a]">{copy.noOffers}</p>;
  }

  return (
    <ol className="space-y-2">
      {offers.map((offer) => (
        <li
          key={offer.id}
          className="rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-2 text-sm text-[#172033]"
        >
          <p className="font-semibold">{formatOfferLine(offer)}</p>
          <p className="mt-1 text-xs text-[#68758a]">
            {copy.priceLabel}: {formatPrice(offer.price)}
            {!offer.matchedBalance ? " · unmatched balance row" : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}
