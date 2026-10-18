import { http, HttpResponse } from "msw";
import { calmFeeStats, congestedFeeStats, malformedFeeStats } from "@/features/fee-stats/fixtures/feeStats.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";
const MAINNET = "https://horizon.stellar.org";

export const handlers = [
  http.get(`${TESTNET}/fee_stats`, () => HttpResponse.json(calmFeeStats)),
  http.get(`${MAINNET}/fee_stats`, () => HttpResponse.json(congestedFeeStats))
];

export const congestedHandler = http.get(`${TESTNET}/fee_stats`, () =>
  HttpResponse.json(congestedFeeStats)
);

export const malformedHandler = http.get(`${TESTNET}/fee_stats`, () =>
  HttpResponse.json(malformedFeeStats)
);

export const rateLimitedHandler = http.get(`${TESTNET}/fee_stats`, () =>
  HttpResponse.json({ title: "Rate limit exceeded", status: 429 }, { status: 429 })
);
