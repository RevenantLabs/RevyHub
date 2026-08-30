import { http, HttpResponse } from "msw";
import {
  clawbackFlags,
  clawbackIssuerId,
  immutableFlags,
  immutableIssuerId,
  issuerAccountResponse,
  issuerId,
  noFlags,
  restrictedFlags,
  restrictedIssuerId,
  unknownIssuerId
} from "@/features/asset-flags-inspector/fixtures/assetFlagsInspector.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";

export const handlers = [
  http.get(`${TESTNET}/accounts/${issuerId}`, () =>
    HttpResponse.json(issuerAccountResponse(issuerId, noFlags))
  ),
  http.get(`${TESTNET}/accounts/${restrictedIssuerId}`, () =>
    HttpResponse.json(issuerAccountResponse(restrictedIssuerId, restrictedFlags))
  ),
  http.get(`${TESTNET}/accounts/${clawbackIssuerId}`, () =>
    HttpResponse.json(issuerAccountResponse(clawbackIssuerId, clawbackFlags))
  ),
  http.get(`${TESTNET}/accounts/${immutableIssuerId}`, () =>
    HttpResponse.json(issuerAccountResponse(immutableIssuerId, immutableFlags))
  ),
  http.get(`${TESTNET}/accounts/${unknownIssuerId}`, () =>
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
