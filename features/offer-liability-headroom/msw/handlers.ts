import { http, HttpResponse } from "msw";
import { horizonUrl } from "@/core/horizon/client";
import {
  accountId,
  accountResponse,
  malformedOffersResponse,
  offersResponse,
  skewedAccountResponse,
  skewedOffersResponse,
  unmatchedOffersFixture,
  unknownAccountId
} from "@/features/offer-liability-headroom/fixtures/offerLiabilityHeadroom.fixture";

export const handlers = [
  http.get(horizonUrl("testnet", `/accounts/${accountId}`), () =>
    HttpResponse.json(accountResponse)
  ),
  http.get(horizonUrl("testnet", `/accounts/${accountId}/offers`), () =>
    HttpResponse.json(offersResponse)
  ),
  http.get(horizonUrl("mainnet", `/accounts/${accountId}`), () =>
    HttpResponse.json(accountResponse)
  ),
  http.get(horizonUrl("mainnet", `/accounts/${accountId}/offers`), () =>
    HttpResponse.json(unmatchedOffersFixture)
  ),
  http.get(horizonUrl("testnet", `/accounts/${unknownAccountId}`), () =>
    HttpResponse.json({ title: "Not Found", status: 404 }, { status: 404 })
  )
];

export const rateLimitedHandler = http.get(horizonUrl("testnet", `/accounts/${accountId}`), () =>
  HttpResponse.json({ title: "Rate limit exceeded", status: 429 }, { status: 429 })
);

export const malformedHandler = http.get(
  horizonUrl("testnet", `/accounts/${accountId}/offers`),
  () => HttpResponse.json(malformedOffersResponse)
);

export const inconsistentHandlerAccount = http.get(
  horizonUrl("testnet", `/accounts/${accountId}`),
  () => HttpResponse.json(skewedAccountResponse)
);

export const inconsistentHandlerOffers = http.get(
  horizonUrl("testnet", `/accounts/${accountId}/offers`),
  () => HttpResponse.json(skewedOffersResponse)
);
