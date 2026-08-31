import { http, HttpResponse } from "msw";
import {
  emptyOperationsPage,
  failedHash,
  failedTransaction,
  missingHash,
  operationsPage,
  successfulHash,
  successfulTransaction
} from "@/features/transaction-lookup/fixtures/transactionLookup.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";

export const handlers = [
  http.get(`${TESTNET}/transactions/${successfulHash}`, () =>
    HttpResponse.json(successfulTransaction)
  ),
  http.get(`${TESTNET}/transactions/${successfulHash}/operations`, () =>
    HttpResponse.json(operationsPage)
  ),
  http.get(`${TESTNET}/transactions/${failedHash}`, () => HttpResponse.json(failedTransaction)),
  http.get(`${TESTNET}/transactions/${failedHash}/operations`, () =>
    HttpResponse.json(emptyOperationsPage)
  ),
  http.get(`${TESTNET}/transactions/${missingHash}`, () =>
    HttpResponse.json({ title: "Resource Missing", status: 404 }, { status: 404 })
  )
];

/** The transaction resolves but its operations endpoint fails. */
export const operationsUnavailableHandler = http.get(
  `${TESTNET}/transactions/${successfulHash}/operations`,
  () => HttpResponse.json({ title: "Internal Server Error", status: 500 }, { status: 500 })
);
