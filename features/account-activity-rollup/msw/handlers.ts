import { http, HttpResponse } from "msw";
import { accountId, emptyAccountId, unknownAccountId, unavailableAccountId, malformedAccountId } from "@/features/account-activity-rollup/fixtures/accountActivityRollup.fixture";
import { firstPageTokens, secondPageTokens, firstPageCursor, stalledPageTokens } from "@/features/account-activity-rollup/fixtures/pagination.fixture";
import { malformedOperation } from "@/features/account-activity-rollup/fixtures/operations.fixture";

const base = "https://horizon-testnet.stellar.org";
function record(token: string, type = "payment", created_at = "2024-01-15T12:00:00Z") {
  return { id: token, paging_token: token, type, created_at };
}
function collection(records: unknown[]) { return { _embedded: { records } }; }

export const handlers = [
  http.get(`${base}/accounts/${accountId}/operations`, ({ request }) => {
    const cursor = new URL(request.url).searchParams.get("cursor");
    if (cursor === firstPageCursor) return HttpResponse.json(collection(secondPageTokens.map((token, index) => record(token, index === 2 ? "change_trust" : "payment", "2024-01-14T23:00:00Z"))));
    if (cursor) return HttpResponse.json(collection([]));
    return HttpResponse.json(collection(firstPageTokens.map((token, index) => record(token, index === 0 ? "change_trust" : "payment", index < 5 ? "2024-01-16T01:00:00Z" : "2024-01-15T12:00:00Z"))));
  }),
  http.get(`${base}/accounts/${emptyAccountId}/operations`, () => HttpResponse.json(collection([]))),
  http.get(`${base}/accounts/${unknownAccountId}/operations`, () => HttpResponse.json({ status: 404 }, { status: 404 })),
  http.get(`${base}/accounts/${unavailableAccountId}/operations`, () => HttpResponse.json({ status: 410 }, { status: 410 })),
  http.get(`${base}/accounts/${malformedAccountId}/operations`, () => HttpResponse.json(collection([malformedOperation])))
];
export const rateLimitedHandler = http.get(`${base}/accounts/${accountId}/operations`, () => HttpResponse.json({ status: 429 }, { status: 429 }));
export const badCursorHandler = http.get(`${base}/accounts/${accountId}/operations`, ({ request }) => new URL(request.url).searchParams.has("cursor") ? HttpResponse.json({ status: 400 }, { status: 400 }) : undefined);
export const stalledPageHandler = http.get(`${base}/accounts/${accountId}/operations`, ({ request }) => new URL(request.url).searchParams.has("cursor") ? HttpResponse.json(collection(stalledPageTokens.map((token) => record(token)))) : undefined);
