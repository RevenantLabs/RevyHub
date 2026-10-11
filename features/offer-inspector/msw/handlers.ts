import { http, HttpResponse } from "msw";
import {
  accountId,
  accountResponse,
  emptyOffersAccountId,
  emptyOffersAccountResponse,
  emptyOffersResponse,
  ledgerResponse,
  offersResponse,
  pageOneOffersResponse,
  pageTwoOffersResponse,
  unknownAccountId
} from "@/features/offer-inspector/fixtures/offerInspector.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";
const MAINNET = "https://horizon.stellar.org";

/** Request mocks used by this slice's tests. */
export const handlers = [
  http.get(`${TESTNET}/accounts/${accountId}`, () => HttpResponse.json(accountResponse)),
  http.get(`${MAINNET}/accounts/${accountId}`, () => HttpResponse.json(accountResponse)),
  http.get(`${TESTNET}/accounts/${emptyOffersAccountId}`, () =>
    HttpResponse.json(emptyOffersAccountResponse)
  ),
  http.get(`${TESTNET}/accounts/${unknownAccountId}`, () =>
    HttpResponse.json(
      {
        type: "https://stellar.org/horizon-errors/not_found",
        title: "Resource Missing",
        status: 404
      },
      { status: 404 }
    )
  ),
  http.get(`${TESTNET}/ledgers`, () => HttpResponse.json(ledgerResponse)),
  http.get(`${MAINNET}/ledgers`, () => HttpResponse.json(ledgerResponse)),
  http.get(`${TESTNET}/accounts/${accountId}/offers`, ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limit = url.searchParams.get("limit");

    if (cursor === "20001") {
      return HttpResponse.json(pageTwoOffersResponse);
    }
    if (limit === "1") {
      return HttpResponse.json(pageOneOffersResponse);
    }
    return HttpResponse.json(offersResponse);
  }),
  http.get(`${MAINNET}/accounts/${accountId}/offers`, () => HttpResponse.json(offersResponse)),
  http.get(`${TESTNET}/accounts/${emptyOffersAccountId}/offers`, () =>
    HttpResponse.json(emptyOffersResponse)
  )
];

export const rateLimitedHandler = http.get(`${TESTNET}/accounts/*`, () =>
  HttpResponse.json({ title: "Rate limit exceeded", status: 429 }, { status: 429 })
);

export const serverErrorHandler = http.get(`${TESTNET}/accounts/*`, () =>
  HttpResponse.json({ title: "Internal Server Error", status: 500 }, { status: 500 })
);

export const ledgerServerErrorHandler = http.get(`${TESTNET}/ledgers`, () =>
  HttpResponse.json({ title: "Internal Server Error", status: 500 }, { status: 500 })
);

