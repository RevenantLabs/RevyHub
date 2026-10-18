import { http, HttpResponse } from "msw";
import {
  assetCode,
  assetCollection,
  assetRecord,
  issuerId
} from "@/features/asset-statistics/fixtures/assetStatistics.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";
const MAINNET = "https://horizon.stellar.org";

function assetsResponse({ request }: { request: Request }) {
  const url = new URL(request.url);
  const exact =
    url.searchParams.get("asset_code") === assetCode &&
    url.searchParams.get("asset_issuer") === issuerId;
  return HttpResponse.json(assetCollection(exact ? [assetRecord] : []));
}

export const handlers = [
  http.get(`${TESTNET}/assets`, assetsResponse),
  http.get(`${MAINNET}/assets`, assetsResponse)
];

export const rateLimitedHandler = http.get(`${TESTNET}/assets`, () =>
  HttpResponse.json({ title: "Rate limit exceeded", status: 429 }, { status: 429 })
);

export const serverErrorHandler = http.get(`${TESTNET}/assets`, () =>
  HttpResponse.json({ title: "Internal Server Error", status: 500 }, { status: 500 })
);
