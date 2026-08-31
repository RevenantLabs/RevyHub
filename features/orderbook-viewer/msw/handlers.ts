import { http, HttpResponse } from "msw";
import { emptyOrderbookResponse, orderbookResponse } from "@/features/orderbook-viewer/fixtures/orderbookViewer.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";
const MAINNET = "https://horizon.stellar.org";

function response({ request }: { request: Request }) {
  const url = new URL(request.url);
  return url.searchParams.get("selling_asset_type") ? HttpResponse.json(orderbookResponse) : HttpResponse.json(emptyOrderbookResponse);
}

export const handlers = [http.get(`${TESTNET}/order_book`, response), http.get(`${MAINNET}/order_book`, response)];

export const emptyHandler = http.get(`${TESTNET}/order_book`, () => HttpResponse.json(emptyOrderbookResponse));
export const rateLimitedHandler = http.get(`${TESTNET}/order_book`, () => HttpResponse.json({ title: "Rate Limit Exceeded", status: 429 }, { status: 429 }));
