import type { Horizon } from "@stellar/stellar-sdk";
import { err, ok, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { stroopsToXlm } from "@/features/offer-inspector/lib/format";
import { toOfferInspectorErrorCode } from "@/features/offer-inspector/lib/offerInspector.errors";
import type {
  DisplayOffer,
  OfferAssetInfo,
  OfferInspectorErrorCode,
  OfferInspectorInput,
  OfferInspectorResult
} from "@/features/offer-inspector/types";

export const DEFAULT_PAGE_SIZE = 10;

type HorizonOfferAsset = Horizon.ServerApi.OfferRecord["selling"];

/** Normalizes a raw Horizon offer asset object into standard slice representation. */
export function normalizeOfferAsset(asset: HorizonOfferAsset): OfferAssetInfo {
  if (asset.asset_type === "native") {
    return {
      isNative: true,
      code: "XLM",
      label: "XLM (native)"
    };
  }
  const code = asset.asset_code ?? "UNKNOWN";
  const issuer = asset.asset_issuer;
  return {
    isNative: false,
    code,
    issuer,
    label: issuer ? `${code}:${issuer}` : code
  };
}

/** Normalizes a Horizon OfferRecord keeping numbers and IDs as strings. */
export function normalizeOfferRecord(record: Horizon.ServerApi.OfferRecord): DisplayOffer {
  return {
    id: String(record.id),
    pagingToken: String(record.paging_token),
    seller: String(record.seller),
    selling: normalizeOfferAsset(record.selling),
    buying: normalizeOfferAsset(record.buying),
    amount: String(record.amount),
    price: String(record.price),
    priceFraction: {
      n: record.price_r.n,
      d: record.price_r.d
    },
    lastModifiedLedger: record.last_modified_ledger,
    lastModifiedTime: record.last_modified_time,
    sponsor: record.sponsor
  };
}

/** Deduplicates offers by ID preserving original order. */
export function deduplicateOffers(offers: DisplayOffer[]): DisplayOffer[] {
  const seen = new Set<string>();
  const deduplicated: DisplayOffer[] = [];
  for (const offer of offers) {
    if (!seen.has(offer.id)) {
      seen.add(offer.id);
      deduplicated.push(offer);
    }
  }
  return deduplicated;
}

/** Fetches account verification, latest ledger, and open offers from Horizon. */
export async function runOfferInspector(
  input: OfferInspectorInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<OfferInspectorResult, OfferInspectorErrorCode>> {
  if (signal?.aborted) {
    return err("request_failed");
  }

  try {
    const server = horizonServer(network);
    const limit = input.limit ?? DEFAULT_PAGE_SIZE;

    await server.loadAccount(input.accountId);

    const ledgers = await server.ledgers().order("desc").limit(1).call();
    const latestLedger = ledgers.records[0];
    const baseReserveInStroops = latestLedger?.base_reserve_in_stroops ?? 5_000_000;
    const latestLedgerSequence = latestLedger?.sequence ?? 0;

    let offersBuilder = server
      .offers()
      .forAccount(input.accountId)
      .limit(limit)
      .order("desc");

    if (input.cursor) {
      offersBuilder = offersBuilder.cursor(input.cursor);
    }

    const offersPage = await offersBuilder.call();
    const normalized = offersPage.records.map(normalizeOfferRecord);
    const deduplicated = deduplicateOffers(normalized);

    const isPartial = offersPage.records.length === limit;
    const nextCursor = isPartial ? offersPage.records.at(-1)?.paging_token : undefined;

    const grossReserveUnits = deduplicated.length;
    const grossReserveStroops = (
      BigInt(grossReserveUnits) * BigInt(baseReserveInStroops)
    ).toString();
    const baseReserveXlm = stroopsToXlm(BigInt(baseReserveInStroops));
    const grossReserveXlm = stroopsToXlm(BigInt(grossReserveStroops));

    return ok({
      accountId: input.accountId,
      offers: deduplicated,
      latestLedgerSequence,
      baseReserveInStroops,
      baseReserveXlm,
      loadedOffersCount: deduplicated.length,
      grossReserveUnits,
      grossReserveStroops,
      grossReserveXlm,
      isPartial,
      nextCursor,
      network
    });
  } catch (error) {
    return err(toOfferInspectorErrorCode(error));
  }
}

/** Fetches the subsequent cursor page of offers and combines them without duplicate IDs. */
export async function loadMoreOffers(
  currentResult: OfferInspectorResult,
  signal?: AbortSignal
): Promise<Result<OfferInspectorResult, OfferInspectorErrorCode>> {
  if (!currentResult.nextCursor || !currentResult.isPartial) {
    return ok(currentResult);
  }

  const nextResult = await runOfferInspector(
    {
      accountId: currentResult.accountId,
      cursor: currentResult.nextCursor
    },
    currentResult.network,
    signal
  );

  if (!nextResult.ok) {
    return nextResult;
  }

  const combinedOffers = deduplicateOffers([
    ...currentResult.offers,
    ...nextResult.value.offers
  ]);

  const grossReserveUnits = combinedOffers.length;
  const grossReserveStroops = (
    BigInt(grossReserveUnits) * BigInt(currentResult.baseReserveInStroops)
  ).toString();
  const grossReserveXlm = stroopsToXlm(BigInt(grossReserveStroops));

  return ok({
    ...currentResult,
    offers: combinedOffers,
    loadedOffersCount: combinedOffers.length,
    grossReserveUnits,
    grossReserveStroops,
    grossReserveXlm,
    isPartial: nextResult.value.isPartial,
    nextCursor: nextResult.value.nextCursor
  });
}

