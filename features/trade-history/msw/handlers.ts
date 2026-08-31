import { http, HttpResponse } from "msw";
import { emptyResponse, pageOneResponse, pageTwoResponse } from "@/features/trade-history/fixtures/tradeHistory.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";
const MAINNET = "https://horizon.stellar.org";
function response({ request }: { request: Request }) { const cursor = new URL(request.url).searchParams.get("cursor"); return HttpResponse.json(cursor === "cursor-next" ? pageTwoResponse : pageOneResponse); }
export const handlers = [http.get(`${TESTNET}/trades`, response), http.get(`${MAINNET}/trades`, response)];
export const emptyHandler = http.get(`${TESTNET}/trades`, () => HttpResponse.json(emptyResponse));
export const rateLimitedHandler = http.get(`${TESTNET}/trades`, () => HttpResponse.json({ title: "Rate Limit Exceeded", status: 429 }, { status: 429 }));
