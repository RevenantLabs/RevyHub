import { http, HttpResponse } from "msw";
import {
  ledgerRecordFixture,
  missingSequence,
  rootResponseFixture,
  sampleSequence
} from "@/features/ledger-lookup/fixtures/ledgerLookup.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";

export const handlers = [
  http.get(`${TESTNET}`, () => HttpResponse.json(rootResponseFixture)),
  http.get(`${TESTNET}/`, () => HttpResponse.json(rootResponseFixture)),
  http.get(`${TESTNET}/ledgers/${sampleSequence}`, () => HttpResponse.json(ledgerRecordFixture)),
  http.get(`${TESTNET}/ledgers/${missingSequence}`, () =>
    HttpResponse.json({ title: "Resource Missing", status: 404 }, { status: 404 })
  )
];

export const rateLimitedRootHandler = http.get(`${TESTNET}/`, () =>
  HttpResponse.json({ title: "Rate Limit Exceeded", status: 429 }, { status: 429 })
);

export const serverErrorRootHandler = http.get(`${TESTNET}/`, () =>
  HttpResponse.json({ title: "Internal Server Error", status: 500 }, { status: 500 })
);
