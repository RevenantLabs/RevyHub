import { delay, http, HttpResponse } from "msw";
import {
  accountId,
  accountResponse,
  effectsResponse,
  ledgerResponse,
  noRelationshipsAccountId,
  noRelationshipsAccountResponse,
  offersResponse,
  unknownAccountId
} from "@/features/sponsored-reserves/fixtures/sponsoredReserves.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";
const MAINNET = "https://horizon.stellar.org";

function accountHandlers(origin: string) {
  return [
    http.get(`${origin}/accounts/${accountId}`, () => HttpResponse.json(accountResponse)),
    http.get(`${origin}/accounts/${accountId}/offers`, () =>
      HttpResponse.json(offersResponse)
    ),
    http.get(`${origin}/accounts/${accountId}/effects`, () =>
      HttpResponse.json(effectsResponse)
    ),
    // Deliberately no offers or effects handler for this account: it has
    // nothing sponsored, so requesting either would fail as unhandled.
    http.get(`${origin}/accounts/${noRelationshipsAccountId}`, () =>
      HttpResponse.json(noRelationshipsAccountResponse)
    ),
    http.get(`${origin}/ledgers`, () => HttpResponse.json(ledgerResponse))
  ];
}

export const handlers = [
  ...accountHandlers(TESTNET),
  ...accountHandlers(MAINNET),
  http.get(`${TESTNET}/accounts/${unknownAccountId}`, () =>
    HttpResponse.json(
      {
        type: "https://stellar.org/horizon-errors/not_found",
        title: "Resource Missing",
        status: 404
      },
      { status: 404 }
    )
  )
];

export const rateLimitedHandler = http.get(`${TESTNET}/accounts/*`, () =>
  HttpResponse.json({ title: "Rate limit exceeded", status: 429 }, { status: 429 })
);

export const serverErrorHandler = http.get(`${TESTNET}/accounts/*`, () =>
  HttpResponse.json({ title: "Internal Server Error", status: 500 }, { status: 500 })
);

export const networkErrorHandler = http.get(`${TESTNET}/accounts/*`, () =>
  HttpResponse.error()
);

export const slowAccountHandler = http.get(
  `${TESTNET}/accounts/${accountId}`,
  async () => {
    await delay(50);
    return HttpResponse.json(accountResponse);
  }
);
