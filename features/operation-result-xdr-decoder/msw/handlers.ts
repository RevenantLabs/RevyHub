import { http, HttpResponse } from "msw";
import { successHash, successRecord, successOperations, missingHash, malformedHash, unsupportedHash, rateLimitedHash, requestFailedHash } from "../fixtures/operationResultXdrDecoder.fixture";
import { partialHash, partialRecord, partialOperations, preOperationHash, preOperationRecord } from "../fixtures/partial-failure.fixture";
import { feeBumpHash, feeBumpRecord, feeBumpOperations } from "../fixtures/fee-bump-result.fixture";
const BASE = "https://horizon-testnet.stellar.org";
const transaction = (hash: string, record: object) => http.get(`${BASE}/transactions/${hash}`, () => HttpResponse.json(record));
const operations = (hash: string, page: object) => http.get(`${BASE}/transactions/${hash}/operations`, ({ request }) => request.url.includes("include_failed=true") ? HttpResponse.json(page) : HttpResponse.json({ status: 400 }, { status: 400 }));
export const handlers = [
  transaction(successHash, successRecord), operations(successHash, successOperations),
  transaction(partialHash, partialRecord), operations(partialHash, partialOperations),
  transaction(preOperationHash, preOperationRecord),
  transaction(feeBumpHash, feeBumpRecord), operations(feeBumpHash, feeBumpOperations),
  transaction(malformedHash, { ...successRecord, hash: malformedHash, result_xdr: "bad!!!" }),
  transaction(unsupportedHash, { ...successRecord, hash: unsupportedHash }), operations(unsupportedHash, { _embedded: { records: [{ id: "1", type: "payment" }] } }),
  http.get(`${BASE}/transactions/${missingHash}`, () => HttpResponse.json({ status: 404 }, { status: 404 })),
  http.get(`${BASE}/transactions/${rateLimitedHash}`, () => HttpResponse.json({ status: 429 }, { status: 429 })),
  http.get(`${BASE}/transactions/${requestFailedHash}`, () => HttpResponse.json({ status: 503 }, { status: 503 }))
];
