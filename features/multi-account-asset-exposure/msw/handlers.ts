import { http, HttpResponse } from "msw";
import { accountA, accountB, accountC, firstResponse, secondResponse } from "../fixtures/multiAccountAssetExposure.fixture";
const testnet = "https://horizon-testnet.stellar.org";
const mainnet = "https://horizon.stellar.org";
export const handlers = [
  ...[testnet, mainnet].flatMap((base) => [
    http.get(`${base}/accounts/${accountA}`, () => HttpResponse.json(firstResponse)),
    http.get(`${base}/accounts/${accountB}`, () => HttpResponse.json(secondResponse)),
    http.get(`${base}/accounts/${accountC}`, () => HttpResponse.json({ status: 404 }, { status: 404 }))
  ])
];
export const rateLimitedHandler = http.get(`${testnet}/accounts/${accountB}`,
  () => HttpResponse.json({ status: 429 }, { status: 429 }));
export const failedHandler = http.get(`${testnet}/accounts/${accountB}`,
  () => HttpResponse.json({ status: 500 }, { status: 500 }));
export const malformedHandler = http.get(`${testnet}/accounts/${accountB}`,
  () => HttpResponse.json({ balances: "invalid" }));
