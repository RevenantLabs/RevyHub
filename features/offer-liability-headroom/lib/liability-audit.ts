import { normalizeOfferAsset } from "@/features/offer-liability-headroom/lib/offer-assets";
import {
  formatRationalApproximate,
  formatRationalDisplay,
  parseAmountString,
  parseRationalPrice,
  subtractAmounts
} from "@/features/offer-liability-headroom/lib/rational-price";
import type {
  BalanceLiabilityRow,
  OfferRow
} from "@/features/offer-liability-headroom/types";

export interface RawHorizonBalance {
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
  balance?: string;
  limit?: string;
  buying_liabilities?: string;
  selling_liabilities?: string;
}

export interface RawHorizonOffer {
  id?: string;
  amount?: string;
  price_r?: { n?: string | number; d?: string | number };
  last_modified_ledger?: number | string;
  selling?: RawHorizonBalance;
  buying?: RawHorizonBalance;
}

export function buildLiabilityRows(balances: RawHorizonBalance[]): BalanceLiabilityRow[] {
  const rows: BalanceLiabilityRow[] = [];

  for (const balance of balances) {
    const asset = normalizeOfferAsset(balance);
    if (!asset) continue;
    if (
      typeof balance.balance !== "string" ||
      parseAmountString(balance.balance) === null
    ) {
      continue;
    }

    const sellingLiabilities = balance.selling_liabilities ?? "0.0000000";
    const buyingLiabilities = balance.buying_liabilities ?? "0.0000000";

    rows.push({
      asset,
      balance: balance.balance,
      sellingLiabilities,
      buyingLiabilities,
      limit: typeof balance.limit === "string" ? balance.limit : null,
      availableToSellEstimate: subtractAmounts(balance.balance, sellingLiabilities)
    });
  }

  return rows;
}

export function buildOfferRows(
  offers: RawHorizonOffer[],
  liabilityKeys: Set<string>
): { offers: OfferRow[]; malformed: boolean } {
  const rows: OfferRow[] = [];

  for (const offer of offers) {
    if (!offer.id || typeof offer.amount !== "string" || parseAmountString(offer.amount) === null) {
      return { offers: [], malformed: true };
    }

    const selling = offer.selling ? normalizeOfferAsset(offer.selling) : null;
    const buying = offer.buying ? normalizeOfferAsset(offer.buying) : null;
    const price = parseRationalPrice(offer.price_r);

    if (!selling || !buying || !price) {
      return { offers: [], malformed: true };
    }

    rows.push({
      id: String(offer.id),
      selling,
      buying,
      amount: offer.amount,
      price: {
        numerator: price.n.toString(),
        denominator: price.d.toString(),
        display: formatRationalDisplay(price.n, price.d),
        approximate: formatRationalApproximate(price.n, price.d)
      },
      lastModifiedLedger:
        offer.last_modified_ledger === undefined || offer.last_modified_ledger === null
          ? null
          : String(offer.last_modified_ledger),
      matchedBalance: liabilityKeys.has(selling.key)
    });
  }

  return { offers: rows, malformed: false };
}

export function maxOfferLedger(offers: OfferRow[]): string | null {
  let max: bigint | null = null;
  for (const offer of offers) {
    if (!offer.lastModifiedLedger) continue;
    try {
      const value = BigInt(offer.lastModifiedLedger);
      if (max === null || value > max) max = value;
    } catch {
      continue;
    }
  }
  return max === null ? null : max.toString();
}
