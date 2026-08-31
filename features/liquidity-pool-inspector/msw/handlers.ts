import { http, HttpResponse } from "msw";
import {
  horizonPoolResponse,
  horizonPoolWithMembers,
  missingPoolId,
  poolId
} from "@/features/liquidity-pool-inspector/fixtures/liquidityPoolInspector.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";
const MAINNET = "https://horizon.stellar.org";

export const handlers = [
  http.get(`${TESTNET}/liquidity_pools/${poolId}`, () => HttpResponse.json(horizonPoolResponse)),
  http.get(`${MAINNET}/liquidity_pools/${poolId}`, () => HttpResponse.json(horizonPoolResponse)),
  http.get(`${TESTNET}/liquidity_pools/${missingPoolId}`, () =>
    HttpResponse.json({ title: "Resource Missing", status: 404 }, { status: 404 })
  ),
  http.get(`${MAINNET}/liquidity_pools/${missingPoolId}`, () =>
    HttpResponse.json({ title: "Resource Missing", status: 404 }, { status: 404 })
  )
];

export const membersPoolHandler = http.get(`${TESTNET}/liquidity_pools/${poolId}`, () =>
  HttpResponse.json(horizonPoolWithMembers)
);

export const rateLimitedHandler = http.get(`${TESTNET}/liquidity_pools/${poolId}`, () =>
  HttpResponse.json({ title: "Rate Limit Exceeded", status: 429 }, { status: 429 })
);
