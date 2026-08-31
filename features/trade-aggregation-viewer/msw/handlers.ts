import { http, HttpResponse } from "msw";
import { aggregationResponse, emptyAggregationResponse } from "@/features/trade-aggregation-viewer/fixtures/tradeAggregationViewer.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";
const MAINNET = "https://horizon.stellar.org";
function response({ request }: { request: Request }) { return new URL(request.url).searchParams.has("base_asset_type") ? HttpResponse.json(aggregationResponse) : HttpResponse.json(emptyAggregationResponse); }
export const handlers = [http.get(`${TESTNET}/trade_aggregations`, response), http.get(`${MAINNET}/trade_aggregations`, response)];
export const emptyHandler = http.get(`${TESTNET}/trade_aggregations`, () => HttpResponse.json(emptyAggregationResponse));
export const rateLimitedHandler = http.get(`${TESTNET}/trade_aggregations`, () => HttpResponse.json({ title: "Rate Limit Exceeded", status: 429 }, { status: 429 }));
