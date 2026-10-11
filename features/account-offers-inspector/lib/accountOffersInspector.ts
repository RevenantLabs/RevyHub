import type { Horizon } from "@stellar/stellar-sdk";
import { ok, err, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toAccountOffersErrorCode } from "@/features/account-offers-inspector/lib/accountOffersInspector.errors";
import type {
  AccountOffersErrorCode,
  AccountOffersResult,
  OfferEntry,
} from "@/features/account-offers-inspector/types";

function normalizeOffer(record: Horizon.ServerApi.OfferRecord, network: StellarNetwork): OfferEntry {
  const sellingAsset = record.selling.asset_type === "native"
    ? "XLM"
    : `${record.selling.asset_code}:${record.selling.asset_issuer}`;
  const buyingAsset = record.buying.asset_type === "native"
    ? "XLM"
    : `${record.buying.asset_code}:${record.buying.asset_issuer}`;

  return {
    id: String(record.id),
    seller: record.seller,
    sellingAsset,
    buyingAsset,
    amount: record.amount,
    price: record.price,
    priceN: record.price_n,
    priceD: record.price_d,
    lastModifiedLedger: record.last_modified_ledger,
    lastModifiedTime: record.last_modified_time,
  };
}

export async function fetchAccountOffers(
  accountId: string,
  network: StellarNetwork
): Promise<Result<AccountOffersResult, AccountOffersErrorCode>> {
  try {
    const server = horizonServer(network);
    const response = await server.offers().forAccount(accountId).call();
    const offers = response.records.map(r => normalizeOffer(r, network));

    return ok({
      accountId,
      offers,
      network,
    });
  } catch (e) {
    const code = toAccountOffersErrorCode(e);
    return err(code);
  }
}
