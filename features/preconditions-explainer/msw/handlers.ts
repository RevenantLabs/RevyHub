import { http, HttpResponse } from "msw";
import {
  emptyLedgerPage,
  ledgerPage
} from "@/features/preconditions-explainer/fixtures/preconditionsExplainer.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";
const MAINNET = "https://horizon.stellar.org";

/** `GET /ledgers?order=desc&limit=1` is the only request this tool makes. */
export const handlers = [
  http.get(`${TESTNET}/ledgers`, () => HttpResponse.json(ledgerPage)),
  http.get(`${MAINNET}/ledgers`, () => HttpResponse.json(ledgerPage))
];

/** Horizon answers, but with a page containing no ledger — `ledger_unavailable`. */
export const emptyLedgerPageHandler = http.get(`${TESTNET}/ledgers`, () =>
  HttpResponse.json(emptyLedgerPage)
);

/** A 404 from the endpoint itself — still `ledger_unavailable`, not a retry. */
export const ledgerNotFoundHandler = http.get(`${TESTNET}/ledgers`, () =>
  HttpResponse.json({ title: "Resource Missing", status: 404 }, { status: 404 })
);

/** A 5xx — worth retrying unchanged, so `request_failed`. */
export const serverErrorHandler = http.get(`${TESTNET}/ledgers`, () =>
  HttpResponse.json({ title: "Internal Server Error", status: 503 }, { status: 503 })
);

/** A dropped connection — also `request_failed`. */
export const transportFailureHandler = http.get(`${TESTNET}/ledgers`, () => HttpResponse.error());
