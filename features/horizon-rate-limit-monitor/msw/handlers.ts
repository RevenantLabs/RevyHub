import { http, HttpResponse } from "msw";
import { HORIZON_URLS } from "@/core/network/config";
import { mainnetHeaders, testnetHeaders } from "@/features/horizon-rate-limit-monitor/fixtures/horizonRateLimitMonitor.fixture";
import { malformedHeaders, missingHeaders, partialHeaders } from "@/features/horizon-rate-limit-monitor/fixtures/missing-headers.fixture";

const testnet = HORIZON_URLS.testnet;
const mainnet = HORIZON_URLS.mainnet;
const reply = (headers: Record<string, string>) => new HttpResponse(null, { status: 200, headers });
export const handlers = [
  http.get(`${testnet}/`, () => reply(testnetHeaders.root)),
  http.get(`${testnet}/ledgers`, () => reply(testnetHeaders.ledgers)),
  http.get(`${testnet}/accounts/:accountId`, () => reply(testnetHeaders.account)),
  http.get(`${mainnet}/`, () => reply(mainnetHeaders.root)),
  http.get(`${mainnet}/ledgers`, () => reply(mainnetHeaders.ledgers)),
  http.get(`${mainnet}/accounts/:accountId`, () => reply(mainnetHeaders.account))
];
export const missingHandler = http.get(`${testnet}/ledgers`, () => reply(missingHeaders));
export const partialHandler = http.get(`${testnet}/ledgers`, () => reply(partialHeaders));
export const malformedHandler = http.get(`${testnet}/ledgers`, () => reply(malformedHeaders));
export const rateLimitedHandler = http.get(`${testnet}/ledgers`, () => new HttpResponse(null, { status: 429 }));
export const failedHandler = http.get(`${testnet}/ledgers`, () => HttpResponse.error());
