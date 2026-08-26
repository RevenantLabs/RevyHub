import { http, HttpResponse } from "msw";
import { accountId, mockSponsoredAccount, mockSponsoringAccountsList } from "./../fixtures/sponsoredReserves.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";
const MAINNET = "https://horizon.stellar.org";

export const handlers = [
  http.get(`${TESTNET}/accounts/${accountId}`, () => HttpResponse.json(mockSponsoredAccount)),
  http.get(`${MAINNET}/accounts/${accountId}`, () => HttpResponse.json(mockSponsoredAccount)),
  http.get(`${TESTNET}/accounts`, ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get("sponsor") === accountId) {
      return HttpResponse.json(mockSponsoringAccountsList);
    }
    return HttpResponse.json({ _embedded: { records: [] } });
  }),
  http.get(`${MAINNET}/accounts`, ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get("sponsor") === accountId) {
      return HttpResponse.json(mockSponsoringAccountsList);
    }
    return HttpResponse.json({ _embedded: { records: [] } });
  })
];
