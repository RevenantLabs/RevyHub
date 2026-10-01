import { http, HttpResponse } from "msw";

const TESTNET = "https://horizon-testnet.stellar.org";

/**
 * Default handlers for Testnet Keypair Generator tests.
 * Freshly generated keypairs are unfunded by default (404 from Horizon).
 */
export const handlers = [
  http.get(`${TESTNET}/accounts/*`, () =>
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

export const fundedAccountHandler = http.get(`${TESTNET}/accounts/*`, () =>
  HttpResponse.json({
    id: "GDEMOACCOUNT",
    subentry_count: 0,
    balances: [{ balance: "10000.0000000", asset_type: "native" }]
  })
);

export const rateLimitedHandler = http.get(`${TESTNET}/accounts/*`, () =>
  HttpResponse.json(
    {
      type: "https://stellar.org/horizon-errors/rate_limit_exceeded",
      title: "Rate Limit Exceeded",
      status: 429
    },
    { status: 429 }
  )
);

export const serverErrorHandler = http.get(`${TESTNET}/accounts/*`, () =>
  HttpResponse.json(
    {
      type: "https://stellar.org/horizon-errors/server_error",
      title: "Internal Server Error",
      status: 500
    },
    { status: 500 }
  )
);
