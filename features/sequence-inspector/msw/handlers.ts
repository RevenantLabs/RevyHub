import { http, HttpResponse } from "msw";
import { accountResponse, missingAccountId } from "@/features/sequence-inspector/fixtures/sequenceInspector.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";
const MAINNET = "https://horizon.stellar.org";

export const handlers = [
  http.get(`${TESTNET}/accounts/${accountResponse.account_id}`, () => HttpResponse.json(accountResponse)),
  http.get(`${MAINNET}/accounts/${accountResponse.account_id}`, () => HttpResponse.json(accountResponse)),
  http.get(`${TESTNET}/accounts/${missingAccountId}`, () =>
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

export const serverErrorHandler = http.get(`${TESTNET}/accounts/*`, () =>
  HttpResponse.json({ title: "Internal Server Error", status: 500 }, { status: 500 })
);
