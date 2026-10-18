import { err, ok, type Result } from "@/core/result/result";
import { horizonUrl } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { copy } from "@/features/offer-liability-headroom/copy";
import {
  buildLiabilityRows,
  buildOfferRows,
  maxOfferLedger,
  type RawHorizonBalance,
  type RawHorizonOffer
} from "@/features/offer-liability-headroom/lib/liability-audit";
import {
  HorizonStatusError,
  toOfferLiabilityHeadroomErrorCode
} from "@/features/offer-liability-headroom/lib/offerLiabilityHeadroom.errors";
import type {
  OfferLiabilityHeadroomErrorCode,
  OfferLiabilityHeadroomInput,
  OfferLiabilityHeadroomResult
} from "@/features/offer-liability-headroom/types";

const REQUEST_TIMEOUT_MS = 15_000;

interface HorizonAccount {
  account_id?: string;
  id?: string;
  last_modified_ledger?: number | string;
  balances?: RawHorizonBalance[];
}

interface HorizonOffersPage {
  _embedded?: { records?: RawHorizonOffer[] };
  records?: RawHorizonOffer[];
}

async function fetchJson(
  url: string,
  signal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort();
  if (signal?.aborted) abortFromCaller();
  else signal?.addEventListener("abort", abortFromCaller, { once: true });
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" }
    });
    return response;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}

export function analyzeOfferLiabilitySnapshot(
  account: HorizonAccount,
  offersPage: HorizonOffersPage,
  network: StellarNetwork,
  accountId: string
): Result<OfferLiabilityHeadroomResult, OfferLiabilityHeadroomErrorCode> {
  const balances = Array.isArray(account.balances) ? account.balances : [];
  const offersRaw = Array.isArray(offersPage._embedded?.records)
    ? offersPage._embedded.records
    : Array.isArray(offersPage.records)
      ? offersPage.records
      : [];

  const liabilities = buildLiabilityRows(balances);
  const liabilityKeys = new Set(liabilities.map((row) => row.asset.key));
  const built = buildOfferRows(offersRaw, liabilityKeys);
  if (built.malformed) return err("malformed_offer");

  const accountLedger =
    account.last_modified_ledger === undefined || account.last_modified_ledger === null
      ? null
      : String(account.last_modified_ledger);
  const offersLedger = maxOfferLedger(built.offers);

  let ledgerSkew = false;
  if (accountLedger && offersLedger) {
    try {
      const delta =
        accountLedger > offersLedger
          ? BigInt(accountLedger) - BigInt(offersLedger)
          : BigInt(offersLedger) - BigInt(accountLedger);
      // Large skew means the two reads are not a coherent snapshot.
      if (delta > 50n) return err("inconsistent_snapshot");
      ledgerSkew = delta > 0n;
    } catch {
      return err("inconsistent_snapshot");
    }
  }

  return ok({
    network,
    accountId: account.account_id ?? account.id ?? accountId,
    accountLedger,
    offersLedger,
    ledgerSkew,
    offers: built.offers,
    liabilities,
    unmatchedOfferCount: built.offers.filter((offer) => !offer.matchedBalance).length,
    disclaimer: copy.disclaimer
  });
}

export async function runOfferLiabilityHeadroom(
  input: OfferLiabilityHeadroomInput,
  network: StellarNetwork,
  signal?: AbortSignal
): Promise<Result<OfferLiabilityHeadroomResult, OfferLiabilityHeadroomErrorCode>> {
  try {
    const accountUrl = horizonUrl(network, `/accounts/${input.accountId}`);
    const accountResponse = await fetchJson(accountUrl, signal);

    if (accountResponse.status === 404) return err("account_not_found");
    if (!accountResponse.ok) throw new HorizonStatusError(accountResponse.status);

    const offersUrl = horizonUrl(network, `/accounts/${input.accountId}/offers`, {
      limit: 200,
      order: "desc"
    });
    const offersResponse = await fetchJson(offersUrl, signal);

    if (offersResponse.status === 404) return err("account_not_found");
    if (!offersResponse.ok) throw new HorizonStatusError(offersResponse.status);

    const account = (await accountResponse.json()) as HorizonAccount;
    const offersPage = (await offersResponse.json()) as HorizonOffersPage;
    return analyzeOfferLiabilitySnapshot(account, offersPage, network, input.accountId);
  } catch (error) {
    return err(toOfferLiabilityHeadroomErrorCode(error));
  }
}
