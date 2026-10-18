import { http, HttpResponse } from "msw";
import {
  accountId,
  accountResponse,
  normalAccountId,
  normalAccountResponse,
  unknownAccountId
} from "@/features/account-signers/fixtures/accountSigners.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";
const MAINNET = "https://horizon.stellar.org";

export const handlers = [
  http.get(`${TESTNET}/accounts/${accountId}`, () => HttpResponse.json(accountResponse)),
  http.get(`${MAINNET}/accounts/${accountId}`, () => HttpResponse.json(accountResponse)),
  http.get(`${TESTNET}/accounts/${normalAccountId}`, () =>
    HttpResponse.json(normalAccountResponse)
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
  )
];

export const rateLimitedHandler = http.get(`${TESTNET}/accounts/*`, () =>
  HttpResponse.json({ title: "Rate limit exceeded", status: 429 }, { status: 429 })
);

export const serverErrorHandler = http.get(`${TESTNET}/accounts/*`, () =>
  HttpResponse.json({ title: "Internal Server Error", status: 500 }, { status: 500 })
);

export const transportFailureHandler = http.get(`${TESTNET}/accounts/*`, () =>
  HttpResponse.error()
);
