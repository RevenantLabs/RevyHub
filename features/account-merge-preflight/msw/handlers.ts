import { http, HttpResponse } from "msw";
import {
  blockedSourceAccount,
  capacityLimitedDestination,
  destinationAccount,
  destinationAccountId,
  mergeableSourceAccount,
  offerPage,
  offers,
  sourceAccountId,
  unknownDestinationAccountId,
  unknownSourceAccountId
} from "@/features/account-merge-preflight/fixtures/accountMergePreflight.fixture";
import type { HorizonOffer } from "@/features/account-merge-preflight/types";

const TESTNET = "https://horizon-testnet.stellar.org";

export const handlers = [
  http.get(`${TESTNET}/accounts/${sourceAccountId}`, () =>
    HttpResponse.json(mergeableSourceAccount)
  ),
  http.get(`${TESTNET}/accounts/${destinationAccountId}`, () =>
    HttpResponse.json(destinationAccount)
  ),
  http.get(`${TESTNET}/accounts/${sourceAccountId}/offers`, () =>
    HttpResponse.json(offerPage([]))
  ),
  http.get(`${TESTNET}/accounts/${unknownSourceAccountId}`, () =>
    HttpResponse.json({ title: "Resource Missing", status: 404 }, { status: 404 })
  ),
  http.get(`${TESTNET}/accounts/${unknownDestinationAccountId}`, () =>
    HttpResponse.json({ title: "Resource Missing", status: 404 }, { status: 404 })
  )
];

export const blockedSourceHandler = http.get(
  `${TESTNET}/accounts/${sourceAccountId}`,
  () => HttpResponse.json(blockedSourceAccount)
);

export const offersHandler = http.get(
  `${TESTNET}/accounts/${sourceAccountId}/offers`,
  () => HttpResponse.json(offerPage(offers))
);

export const capacityLimitedDestinationHandler = http.get(
  `${TESTNET}/accounts/${destinationAccountId}`,
  () => HttpResponse.json(capacityLimitedDestination)
);

export const sourceUnavailableHandler = http.get(
  `${TESTNET}/accounts/${sourceAccountId}`,
  () => HttpResponse.json({ title: "Unavailable", status: 503 }, { status: 503 })
);

export const offersUnavailableHandler = http.get(
  `${TESTNET}/accounts/${sourceAccountId}/offers`,
  () => HttpResponse.json({ title: "Unavailable", status: 503 }, { status: 503 })
);

const fullPage: HorizonOffer[] = Array.from({ length: 200 }, (_, index) => ({
  ...offers[0],
  id: String(index + 1),
  paging_token: String(index + 1)
}));

export const paginatedOffersHandler = http.get(
  `${TESTNET}/accounts/${sourceAccountId}/offers`,
  ({ request }) => {
    const cursor = new URL(request.url).searchParams.get("cursor");
    return HttpResponse.json(offerPage(cursor === "200" ? [offers[1]] : fullPage));
  }
);
