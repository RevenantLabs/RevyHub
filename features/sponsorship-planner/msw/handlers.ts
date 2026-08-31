import { delay, http, HttpResponse } from "msw";
import {
  baseReserveStroops,
  claimableBalancesResponse,
  effectsResponse,
  existingSponsorId,
  ledgerResponse,
  newSponsoredAccountId,
  notFoundBody,
  offersResponse,
  poorSponsorAccountId,
  poorSponsorAccountResponse,
  sponsorAccountId,
  sponsorAccountResponse,
  sponsoredAccountId,
  sponsoredAccountResponse,
  unknownSponsorAccountId
} from "@/features/sponsorship-planner/fixtures/sponsorshipPlanner.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";
const MAINNET = "https://horizon.stellar.org";

function networkHandlers(origin: string) {
  return [
    http.get(`${origin}/accounts/${sponsorAccountId}`, () =>
      HttpResponse.json(sponsorAccountResponse)
    ),
    http.get(`${origin}/accounts/${poorSponsorAccountId}`, () =>
      HttpResponse.json(poorSponsorAccountResponse)
    ),
    http.get(`${origin}/accounts/${sponsoredAccountId}`, () =>
      HttpResponse.json(sponsoredAccountResponse)
    ),
    http.get(`${origin}/accounts/${sponsoredAccountId}/offers`, () =>
      HttpResponse.json(offersResponse)
    ),
    http.get(`${origin}/accounts/${sponsoredAccountId}/effects`, () =>
      HttpResponse.json(effectsResponse)
    ),
    http.get(`${origin}/claimable_balances`, ({ request }) => {
      const url = new URL(request.url);
      if (url.searchParams.get("claimant") === sponsoredAccountId) {
        return HttpResponse.json(claimableBalancesResponse);
      }
      return HttpResponse.json({ _embedded: { records: [] } });
    }),
    http.get(`${origin}/ledgers`, () => HttpResponse.json(ledgerResponse)),
    http.get(`${origin}/accounts/${newSponsoredAccountId}`, () =>
      HttpResponse.json(notFoundBody, { status: 404 })
    ),
    http.get(`${origin}/accounts/${unknownSponsorAccountId}`, () =>
      HttpResponse.json(notFoundBody, { status: 404 })
    )
  ];
}

export const handlers = [...networkHandlers(TESTNET), ...networkHandlers(MAINNET)];

export const rateLimitedHandler = http.get(`${TESTNET}/accounts/*`, () =>
  HttpResponse.json({ title: "Rate limit exceeded", status: 429 }, { status: 429 })
);

export const serverErrorHandler = http.get(`${TESTNET}/accounts/*`, () =>
  HttpResponse.json({ title: "Internal Server Error", status: 500 }, { status: 500 })
);

export const networkErrorHandler = http.get(`${TESTNET}/accounts/*`, () =>
  HttpResponse.error()
);

/** A ledger page with no usable base reserve. */
export const ledgerUnavailableHandler = http.get(`${TESTNET}/ledgers`, () =>
  HttpResponse.json({ _embedded: { records: [] } })
);

export const slowSponsorHandler = http.get(
  `${TESTNET}/accounts/${sponsorAccountId}`,
  async () => {
    await delay(50);
    return HttpResponse.json(sponsorAccountResponse);
  }
);

export { existingSponsorId, baseReserveStroops };
