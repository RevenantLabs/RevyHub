import { http, HttpResponse } from "msw";
import {
  accountId,
  accountResponse,
  creditBalances,
  unknownAccountId,
  wrongIssuerBalances
} from "@/features/trustline-checker/fixtures/trustlineChecker.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";

export const handlers = [
  http.get(`${TESTNET}/accounts/${accountId}`, () =>
    HttpResponse.json(accountResponse(creditBalances))
  ),
  http.get(`${TESTNET}/accounts/${unknownAccountId}`, () =>
    HttpResponse.json({ title: "Resource Missing", status: 404 }, { status: 404 })
  )
];

export const wrongIssuerHandler = http.get(`${TESTNET}/accounts/${accountId}`, () =>
  HttpResponse.json(accountResponse(wrongIssuerBalances))
);
