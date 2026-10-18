import { http, HttpResponse } from "msw";
import {
  accountId,
  operationsCollection,
  pageOneRecords,
  pageOneCursor,
  pageTwoRecords,
  unknownAccountId
} from "@/features/operation-browser/fixtures/operationBrowser.fixture";

const TESTNET = "https://horizon-testnet.stellar.org";

export const handlers = [
  http.get(`${TESTNET}/accounts/${accountId}/operations`, ({ request }) => {
    const cursor = new URL(request.url).searchParams.get("cursor");
    if (cursor === pageOneCursor) {
      return HttpResponse.json(operationsCollection(pageTwoRecords));
    }
    if (cursor) {
      return HttpResponse.json(operationsCollection([]));
    }
    return HttpResponse.json(operationsCollection(pageOneRecords));
  }),
  http.get(`${TESTNET}/accounts/${unknownAccountId}/operations`, () =>
    HttpResponse.json({ title: "Resource Missing", status: 404 }, { status: 404 })
  )
];

export const rateLimitedHandler = http.get(`${TESTNET}/accounts/${accountId}/operations`, () =>
  HttpResponse.json({ title: "Rate Limit Exceeded", status: 429 }, { status: 429 })
);
