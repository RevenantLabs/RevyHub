import type { PaginationInspection } from "@/features/horizon-pagination-inspector/types";

/**
 * Deterministic Horizon collection envelopes.
 *
 * These are constructed from fixed values rather than captured from a live
 * network, so every run sees identical bytes and the expectations cannot drift
 * when a testnet resets.
 */

/**
 * Horizon paging tokens are decimal strings that routinely exceed
 * Number.MAX_SAFE_INTEGER. Starting above that boundary keeps the fixtures
 * honest about the arithmetic the tool is required to get right.
 */
const BASE_TOKEN = BigInt("4640000000000000000");

export const pagingToken = (offset: number): string => String(BASE_TOKEN + BigInt(offset));

const HORIZON = "https://horizon-testnet.stellar.org";

const transactionHash = (offset: number): string =>
  String(offset).repeat(64).slice(0, 64);

function paymentRecord(offset: number, idSuffix: string) {
  return {
    id: idSuffix,
    paging_token: pagingToken(offset),
    successful: true,
    type: "payment",
    created_at: "2026-01-0" + String((offset % 9) + 1) + "T00:00:00Z",
    transaction_hash: transactionHash(offset)
  };
}

const collection = (cursor: string, limit: number) =>
  HORIZON + "/payments?cursor=" + cursor + "&limit=" + String(limit) + "&order=asc";

/** A full page that explicitly offers a next link. */
export const completePage = {
  _links: {
    self: { href: collection("", 3) },
    next: { href: collection(pagingToken(2), 3) },
    prev: { href: collection(pagingToken(0), 3) }
  },
  _embedded: {
    records: [paymentRecord(0, "1"), paymentRecord(1, "2"), paymentRecord(2, "3")]
  }
};

/**
 * The case the tool exists for: a page holding fewer records than the limit,
 * which nevertheless carries a next link. Page length is not a paging signal.
 */
export const shortPageWithNext = {
  _links: {
    self: { href: collection("", 200) },
    next: { href: collection(pagingToken(0), 200) }
  },
  _embedded: { records: [paymentRecord(0, "1")] }
};

/** A page with a links object that offers no next link. */
export const finalPage = {
  _links: {
    self: { href: collection(pagingToken(9), 2) },
    prev: { href: collection(pagingToken(0), 2) }
  },
  _embedded: { records: [paymentRecord(7, "7"), paymentRecord(8, "8")] }
};

/** No links object at all, so the response proves nothing about paging. */
export const noLinksObject = {
  _embedded: { records: [paymentRecord(0, "1")] }
};

/** Two records claiming the same paging token. */
export const duplicateTokens = {
  _links: { next: { href: collection(pagingToken(1), 2) } },
  _embedded: {
    records: [
      paymentRecord(0, "1"),
      { ...paymentRecord(1, "2"), paging_token: pagingToken(0) }
    ]
  }
};

/** One record carrying neither paging_token nor id. */
export const missingIdentifier = {
  _links: { next: { href: collection(pagingToken(1), 2) } },
  _embedded: {
    records: [
      paymentRecord(0, "1"),
      { type: "payment", successful: true, created_at: "2026-01-02T00:00:00Z" }
    ]
  }
};

/** A paging token that is not a decimal integer. */
export const nonNumericToken = {
  _links: {},
  _embedded: {
    records: [
      { ...paymentRecord(0, "1"), paging_token: "not-a-number" },
      paymentRecord(1, "2")
    ]
  }
};

/** Tokens that decrease relative to page order. */
export const outOfOrderTokens = {
  _links: {},
  _embedded: {
    records: [paymentRecord(5, "5"), paymentRecord(2, "2")]
  }
};

/** A payments page carrying a link whose cursor has no value at all. */
export const nextLinkWithoutCursor = {
  _links: { next: { href: HORIZON + "/payments?limit=3&order=asc" } },
  _embedded: { records: [paymentRecord(0, "1")] }
};

export const completePageJson = JSON.stringify(completePage, null, 2);
export const shortPageWithNextJson = JSON.stringify(shortPageWithNext, null, 2);
export const finalPageJson = JSON.stringify(finalPage, null, 2);
export const noLinksObjectJson = JSON.stringify(noLinksObject, null, 2);
export const duplicateTokensJson = JSON.stringify(duplicateTokens, null, 2);
export const missingIdentifierJson = JSON.stringify(missingIdentifier, null, 2);
export const nonNumericTokenJson = JSON.stringify(nonNumericToken, null, 2);
export const outOfOrderTokensJson = JSON.stringify(outOfOrderTokens, null, 2);
export const nextLinkWithoutCursorJson = JSON.stringify(nextLinkWithoutCursor, null, 2);

/* Inputs that are not a collection response at all. */

/** A shell error line rather than a response body. */
export const notJson = "curl: (7) Failed to connect to horizon-testnet.stellar.org";

/** Valid JSON, wrong shape. */
export const jsonArray = "[1, 2, 3]";
export const jsonPrimitive = "42";
export const missingRecords = '{ "_links": { "self": { "href": "/payments" } } }';
export const recordsNotAnArray = '{ "_embedded": { "records": { "id": "1" } } }';

/** A representative successful result, for component tests that render one. */
export const completePageInspection: PaginationInspection = {
  recordCount: 3,
  hasLinksObject: true,
  next: { href: collection(pagingToken(2), 3), cursor: pagingToken(2), params: [] },
  prev: { href: collection(pagingToken(0), 3), cursor: pagingToken(0), params: [] },
  missingIdentifiers: [],
  nonNumericTokens: [],
  duplicates: [],
  tokenOrder: "increasing"
};
