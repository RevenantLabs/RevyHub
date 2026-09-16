/**
 * Reusable MSW request handlers for Horizon and Friendbot.
 *
 * Default handlers cover the happy path for every major endpoint.
 * Use scenarioHandlers to add per-test overrides via server.use().
 */

import { http, HttpResponse, delay } from "msw";
import {
  accountFixture,
  transactionFixture,
  feeStatsFixture,
  friendbotSuccessFixture,
  notFoundError,
  rateLimitError,
  internalServerError,
  friendbotAlreadyFundedError,
  FIXTURE_ACCOUNT_ID,
  FIXTURE_TX_HASH
} from "./fixtures";

// ---------------------------------------------------------------------------
// Base URLs
// ---------------------------------------------------------------------------

const TESTNET = "https://horizon-testnet.stellar.org";
const MAINNET = "https://horizon.stellar.org";
const FRIENDBOT = "https://friendbot.stellar.org";

// ---------------------------------------------------------------------------
// Default handlers — happy-path responses
// ---------------------------------------------------------------------------

export const defaultHandlers = [
  // Testnet: load account
  http.get(`${TESTNET}/accounts/:accountId`, ({ params }) => {
    // Return the fixture for the canonical address; 404 for everything else
    if (params.accountId === FIXTURE_ACCOUNT_ID) {
      return HttpResponse.json(accountFixture);
    }
    return HttpResponse.json(notFoundError, { status: 404 });
  }),

  // Mainnet: load account
  http.get(`${MAINNET}/accounts/:accountId`, ({ params }) => {
    if (params.accountId === FIXTURE_ACCOUNT_ID) {
      return HttpResponse.json(accountFixture);
    }
    return HttpResponse.json(notFoundError, { status: 404 });
  }),

  // Testnet: transaction by hash
  http.get(`${TESTNET}/transactions/:hash`, ({ params }) => {
    if (params.hash === FIXTURE_TX_HASH) {
      return HttpResponse.json(transactionFixture);
    }
    return HttpResponse.json(notFoundError, { status: 404 });
  }),

  // Mainnet: transaction by hash
  http.get(`${MAINNET}/transactions/:hash`, ({ params }) => {
    if (params.hash === FIXTURE_TX_HASH) {
      return HttpResponse.json(transactionFixture);
    }
    return HttpResponse.json(notFoundError, { status: 404 });
  }),

  // Testnet: fee stats
  http.get(`${TESTNET}/fee_stats`, () => {
    return HttpResponse.json(feeStatsFixture);
  }),

  // Mainnet: fee stats
  http.get(`${MAINNET}/fee_stats`, () => {
    return HttpResponse.json(feeStatsFixture);
  }),

  // Friendbot: fund testnet account
  http.get(FRIENDBOT, ({ request }) => {
    const addr = new URL(request.url).searchParams.get("addr");
    if (!addr) {
      return HttpResponse.json(notFoundError, { status: 404 });
    }
    return HttpResponse.json(friendbotSuccessFixture);
  })
];

// ---------------------------------------------------------------------------
// Scenario overrides — pass to server.use() inside individual tests
// ---------------------------------------------------------------------------

export const scenarioHandlers = {
  /** Testnet account lookup returns 404 */
  accountNotFound: http.get(`${TESTNET}/accounts/:accountId`, () =>
    HttpResponse.json(notFoundError, { status: 404 })
  ),

  /** Mainnet account lookup returns 404 */
  accountNotFoundMainnet: http.get(`${MAINNET}/accounts/:accountId`, () =>
    HttpResponse.json(notFoundError, { status: 404 })
  ),

  /** Transaction lookup returns 404 */
  transactionNotFound: http.get(`${TESTNET}/transactions/:hash`, () =>
    HttpResponse.json(notFoundError, { status: 404 })
  ),

  /** Horizon rate-limits the account request */
  accountRateLimited: http.get(`${TESTNET}/accounts/:accountId`, () =>
    HttpResponse.json(rateLimitError, { status: 429 })
  ),

  /** Horizon returns a 500 for the account request */
  accountServerError: http.get(`${TESTNET}/accounts/:accountId`, () =>
    HttpResponse.json(internalServerError, { status: 500 })
  ),

  /** Friendbot returns the already-funded 400 error */
  friendbotAlreadyFunded: http.get(FRIENDBOT, () =>
    HttpResponse.json(friendbotAlreadyFundedError, { status: 400 })
  ),

  /** Friendbot returns a rate-limit 429 */
  friendbotRateLimited: http.get(FRIENDBOT, () =>
    HttpResponse.json(rateLimitError, { status: 429 })
  ),

  /** Account endpoint responds with a deliberate 400ms delay */
  accountDelayed: http.get(`${TESTNET}/accounts/:accountId`, async () => {
    await delay(400);
    return HttpResponse.json(accountFixture);
  }),

  /** Account endpoint times out (never responds) */
  accountTimeout: http.get(`${TESTNET}/accounts/:accountId`, async () => {
    await delay("infinite");
    return HttpResponse.json(accountFixture);
  }),

  /** Account endpoint returns malformed JSON */
  accountMalformedJson: http.get(`${TESTNET}/accounts/:accountId`, () =>
    new HttpResponse("{ this is not json }", {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  ),

  /** Transaction endpoint returns a 404 on mainnet */
  transactionNotFoundMainnet: http.get(`${MAINNET}/transactions/:hash`, () =>
    HttpResponse.json(notFoundError, { status: 404 })
  ),

  /** Fee stats returns a server error */
  feeStatsServerError: http.get(`${TESTNET}/fee_stats`, () =>
    HttpResponse.json(internalServerError, { status: 500 })
  )
};
