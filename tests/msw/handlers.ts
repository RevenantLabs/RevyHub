import { http, HttpResponse } from "msw";
import {
  createAccountFixture,
  accountWithTrustline,
  createTransactionFixture,
  createFeeFixture,
  createFriendbotSuccessFixture,
  createErrorFixture
} from "./fixtures";

/* ------------------------------------------------------------------ */
/*  Base URLs                                                         */
/* ------------------------------------------------------------------ */

const TESTNET_HORIZON = "https://horizon-testnet.stellar.org";
const MAINNET_HORIZON = "https://horizon.stellar.org";
const FRIENDBOT_URL = "https://friendbot.stellar.org";

/* ------------------------------------------------------------------ */
/*  Reusable handlers                                                 */
/* ------------------------------------------------------------------ */

export const handlers = [
  // ── Accounts ─────────────────────────────────────────────────────
  http.get(`${TESTNET_HORIZON}/accounts/:id`, ({ params }) => {
    const accountId = params.id as string;
    return HttpResponse.json(createAccountFixture({ account_id: accountId, id: accountId }));
  }),

  http.get(`${MAINNET_HORIZON}/accounts/:id`, ({ params }) => {
    const accountId = params.id as string;
    return HttpResponse.json(createAccountFixture({ account_id: accountId, id: accountId }));
  }),

  // ── Transactions ─────────────────────────────────────────────────
  http.get(`${TESTNET_HORIZON}/transactions/:hash`, () => {
    return HttpResponse.json(createTransactionFixture());
  }),

  http.get(`${MAINNET_HORIZON}/transactions/:hash`, () => {
    return HttpResponse.json(createTransactionFixture());
  }),

  // ── Fee ──────────────────────────────────────────────────────────
  http.get(`${TESTNET_HORIZON}/fee`, () => {
    return HttpResponse.json(createFeeFixture());
  }),

  http.get(`${MAINNET_HORIZON}/fee`, () => {
    return HttpResponse.json(createFeeFixture());
  }),

  // ── Friendbot ────────────────────────────────────────────────────
  http.get(FRIENDBOT_URL, ({ request }) => {
    const url = new URL(request.url);

    if (!url.searchParams.has("addr")) {
      return HttpResponse.json(
        createErrorFixture(400, "Friendbot requires an addr query parameter."),
        { status: 400 }
      );
    }

    return HttpResponse.json(createFriendbotSuccessFixture());
  })
];

/* ------------------------------------------------------------------ */
/*  Scenario override helpers —— use regex to match multi-origin URLs */
/* ------------------------------------------------------------------ */

const anyHorizonAccount = /https:\/\/horizon(-testnet)?\.stellar\.org\/accounts\/.+/;

/**
 * Simulate a delayed response, useful for testing loading states.
 */
export function simulateDelay(ms = 2000) {
  return http.get(anyHorizonAccount, async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
    return HttpResponse.json(createAccountFixture());
  });
}

/**
 * Simulate a network timeout by never resolving (use with a test timeout).
 */
export function simulateTimeout() {
  return http.get(anyHorizonAccount, async () => {
    await new Promise(() => {}); // never resolves
    return HttpResponse.json(createAccountFixture());
  });
}

/**
 * Simulate a malformed JSON response.
 */
export function simulateMalformedJson() {
  return http.get(anyHorizonAccount, () => {
    return new HttpResponse("this is not valid json", {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  });
}

/**
 * Simulate a 429 Rate Limit response.
 */
export function simulateRateLimit() {
  return http.get(anyHorizonAccount, () => {
    return HttpResponse.json(createErrorFixture(429, "Rate limit exceeded. Try again later."), {
      status: 429
    });
  });
}

/**
 * Simulate a 404 Not Found response.
 */
export function simulateNotFound() {
  return http.get(anyHorizonAccount, () => {
    return HttpResponse.json(createErrorFixture(404, "Resource not found."), {
      status: 404
    });
  });
}

/**
 * Simulate a 500 Internal Server Error response.
 */
export function simulateServerError() {
  return http.get(anyHorizonAccount, () => {
    return HttpResponse.json(createErrorFixture(500, "Internal server error."), {
      status: 500
    });
  });
}

/**
 * Return an account fixture that includes a specific trustline.
 */
export function simulateTrustlineExists(assetCode: string, assetIssuer: string) {
  return http.get(anyHorizonAccount, () => {
    return HttpResponse.json(accountWithTrustline(assetCode, assetIssuer));
  });
}

/**
 * Simulate a 500 error on the Friendbot endpoint.
 */
export function simulateFriendbotError() {
  return http.get(FRIENDBOT_URL, () => {
    return HttpResponse.json(
      createErrorFixture(500, "Friendbot internal error."),
      { status: 500 }
    );
  });
}
