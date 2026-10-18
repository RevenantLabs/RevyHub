import { http, HttpResponse } from "msw";
import { emptyPoolId, emptyPoolResponse, missingPoolId, poolId, poolResponse } from "@/features/liquidity-pool-calculator/fixtures/liquidityPoolCalculator.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";
const MAINNET = "https://horizon.stellar.org";

function routes(base: string) {
  return [
    http.get(`${base}/liquidity_pools/${poolId}`, () => HttpResponse.json(poolResponse)),
    http.get(`${base}/liquidity_pools/${emptyPoolId}`, () => HttpResponse.json(emptyPoolResponse)),
    http.get(`${base}/liquidity_pools/${missingPoolId}`, () => HttpResponse.json({ title: "Resource Missing", status: 404 }, { status: 404 }))
  ];
}

export const handlers = [...routes(TESTNET), ...routes(MAINNET)];

export const rateLimitedHandler = http.get(`${TESTNET}/liquidity_pools/${poolId}`, () => HttpResponse.json({ title: "Rate Limit Exceeded", status: 429 }, { status: 429 }));
