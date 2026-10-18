import { http, HttpResponse } from "msw";
import {
  accountId,
  horizonAccount,
  missingAccountId
} from "@/features/sequence-inspector/fixtures/sequenceInspector.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";

export const handlers = [
  http.get(`${TESTNET}/accounts/${accountId}`, () => HttpResponse.json(horizonAccount)),
  http.get(`${TESTNET}/accounts/${missingAccountId}`, () =>
    HttpResponse.json({ title: "Resource Missing", status: 404 }, { status: 404 })
  )
];

export const horizonUnavailableHandler = http.get(
  `${TESTNET}/accounts/${accountId}`,
  () => HttpResponse.json({ title: "Internal Server Error", status: 503 }, { status: 503 })
);

export const transportFailureHandler = http.get(
  `${TESTNET}/accounts/${accountId}`,
  () => HttpResponse.error()
);
