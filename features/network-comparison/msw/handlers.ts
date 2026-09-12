import { http, HttpResponse } from "msw";
import {
  mainnetLedgerResponse,
  mainnetRootResponse,
  testnetLedgerResponse,
  testnetRootResponse
} from "@/features/network-comparison/fixtures/networkComparison.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";
const MAINNET = "https://horizon.stellar.org";

export const handlers = [
  http.get(`${TESTNET}/`, () => HttpResponse.json(testnetRootResponse)),
  http.get(`${MAINNET}/`, () => HttpResponse.json(mainnetRootResponse)),
  http.get(`${TESTNET}/ledgers`, () => HttpResponse.json(testnetLedgerResponse)),
  http.get(`${MAINNET}/ledgers`, () => HttpResponse.json(mainnetLedgerResponse))
];

export const testnetErrorHandler = http.get(`${TESTNET}/ledgers`, () =>
  HttpResponse.json({ title: "Internal Server Error", status: 500 }, { status: 500 })
);

export const mainnetErrorHandler = http.get(`${MAINNET}/ledgers`, () =>
  HttpResponse.json({ title: "Internal Server Error", status: 500 }, { status: 500 })
);

export const bothErrorHandler = [
  http.get(`${TESTNET}/ledgers`, () =>
    HttpResponse.json({ title: "Internal Server Error", status: 500 }, { status: 500 })
  ),
  http.get(`${MAINNET}/ledgers`, () =>
    HttpResponse.json({ title: "Internal Server Error", status: 500 }, { status: 500 })
  )
];
