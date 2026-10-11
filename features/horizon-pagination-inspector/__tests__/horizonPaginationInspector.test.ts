import { describe, expect, it } from "vitest";
import {
  extractQueryParamRaw,
  inspectHorizonPagination,
  parseHalLink
} from "@/features/horizon-pagination-inspector/lib/horizonPaginationInspector";
import {
  duplicateIdsCollectionJson,
  duplicateTokensCollectionJson,
  emptyRecordsCollectionJson,
  encodedCursorCollectionJson,
  encodedCursorString,
  hostileLinksCollectionJson,
  hugeCursorCollectionJson,
  hugeCursorString,
  malformedJson,
  missingMetadataCollectionJson,
  nonCollectionJson,
  offOriginCollectionJson,
  validCollectionJson
} from "@/features/horizon-pagination-inspector/fixtures/horizonPaginationInspector.fixture";

describe("extractQueryParamRaw", () => {
  it("preserves percent-encoded values without decoding", () => {
    const search = "?cursor=foo%2Bbar%3D%3D&limit=10";
    expect(extractQueryParamRaw(search, "cursor")).toBe("foo%2Bbar%3D%3D");
    expect(extractQueryParamRaw(search, "limit")).toBe("10");
    expect(extractQueryParamRaw(search, "unknown")).toBeNull();
  });
});

describe("parseHalLink", () => {
  it("returns null for non-object link data or missing href", () => {
    expect(parseHalLink("self", null, null)).toBeNull();
    expect(parseHalLink("self", {}, null)).toBeNull();
    expect(parseHalLink("self", { href: 123 }, null)).toBeNull();
  });

  it("identifies hostile schemes as unsafe and not valid HTTP", () => {
    const parsed = parseHalLink("self", { href: "javascript:alert(1)" }, null);
    expect(parsed).toMatchObject({
      isHostileScheme: true,
      isValidHttp: false
    });
  });

  it("identifies data URI scheme as hostile", () => {
    const parsed = parseHalLink("next", { href: "data:text/html,<script>" }, null);
    expect(parsed).toMatchObject({
      isHostileScheme: true,
      isValidHttp: false
    });
  });

  it("detects off-origin links when expectedOrigin differs", () => {
    const parsed = parseHalLink(
      "self",
      { href: "https://evil.example.com/transactions" },
      "https://horizon.stellar.org"
    );
    expect(parsed).toMatchObject({
      isOffOrigin: true,
      isValidHttp: true
    });
  });

  it("flags templated links and disables valid HTTP copy control", () => {
    const parsed = parseHalLink(
      "transactions",
      { href: "https://horizon.stellar.org/transactions{?cursor,limit,order}", templated: true },
      null
    );
    expect(parsed).toMatchObject({
      templated: true,
      isValidHttp: false
    });
  });
});

describe("inspectHorizonPagination", () => {
  it("fails with invalid_json on malformed JSON input", () => {
    const result = inspectHorizonPagination({
      collectionText: malformedJson,
      expectedOrigin: null
    });
    expect(result).toEqual({ ok: false, code: "invalid_json" });
  });

  it("fails with invalid_collection on non-collection payload", () => {
    const result = inspectHorizonPagination({
      collectionText: nonCollectionJson,
      expectedOrigin: null
    });
    expect(result).toEqual({ ok: false, code: "invalid_collection" });
  });

  it("fails with invalid_collection when _embedded or _links are missing", () => {
    const noLinks = JSON.stringify({ _embedded: { records: [] } });
    expect(
      inspectHorizonPagination({ collectionText: noLinks, expectedOrigin: null })
    ).toEqual({ ok: false, code: "invalid_collection" });

    const noRecords = JSON.stringify({ _links: {}, _embedded: {} });
    expect(
      inspectHorizonPagination({ collectionText: noRecords, expectedOrigin: null })
    ).toEqual({ ok: false, code: "invalid_collection" });
  });

  it("successfully parses valid collection without numeric coercion", () => {
    const result = inspectHorizonPagination({
      collectionText: validCollectionJson,
      expectedOrigin: null
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.recordCount).toBe(3);
    expect(result.value.records[0].id).toBe("12884905985");
    expect(typeof result.value.records[0].id).toBe("string");
    expect(result.value.hasAnomalies).toBe(false);
    expect(result.value.selfLink).toMatchObject({
      endpointPath: "/accounts/GAA/operations",
      cursor: "100",
      limit: "10",
      order: "asc"
    });
  });

  it("handles empty records collection as valid success", () => {
    const result = inspectHorizonPagination({
      collectionText: emptyRecordsCollectionJson,
      expectedOrigin: null
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.recordCount).toBe(0);
    expect(result.value.records).toEqual([]);
    expect(result.value.hasAnomalies).toBe(false);
  });

  it("detects duplicate record IDs", () => {
    const result = inspectHorizonPagination({
      collectionText: duplicateIdsCollectionJson,
      expectedOrigin: null
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.duplicateIdCount).toBe(2);
    expect(result.value.duplicateIds).toEqual(["dup-id-999"]);
    expect(result.value.records[0].duplicateId).toBe(true);
    expect(result.value.records[1].duplicateId).toBe(false);
    expect(result.value.records[2].duplicateId).toBe(true);
    expect(result.value.hasAnomalies).toBe(true);
  });

  it("detects duplicate paging tokens", () => {
    const result = inspectHorizonPagination({
      collectionText: duplicateTokensCollectionJson,
      expectedOrigin: null
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.duplicateTokenCount).toBe(2);
    expect(result.value.duplicateTokens).toEqual(["dup-token-555"]);
    expect(result.value.records[0].duplicateToken).toBe(true);
    expect(result.value.records[1].duplicateToken).toBe(true);
    expect(result.value.hasAnomalies).toBe(true);
  });

  it("detects missing record IDs and paging tokens", () => {
    const result = inspectHorizonPagination({
      collectionText: missingMetadataCollectionJson,
      expectedOrigin: null
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.missingIdCount).toBe(1);
    expect(result.value.missingTokenCount).toBe(1);
    expect(result.value.records[0].missingId).toBe(true);
    expect(result.value.records[1].missingToken).toBe(true);
    expect(result.value.hasAnomalies).toBe(true);
  });

  it("preserves huge cursor strings without truncation or error", () => {
    const result = inspectHorizonPagination({
      collectionText: hugeCursorCollectionJson,
      expectedOrigin: null
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.records[0].pagingToken).toBe(hugeCursorString);
    expect(result.value.selfLink?.cursor).toBe(hugeCursorString);
    expect(result.value.nextLink?.cursor).toBe(hugeCursorString);
  });

  it("preserves percent-encoded cursors in link inspection", () => {
    const result = inspectHorizonPagination({
      collectionText: encodedCursorCollectionJson,
      expectedOrigin: null
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.selfLink?.cursor).toBe(encodedCursorString);
  });

  it("flags off-origin links when expectedOrigin is set", () => {
    const result = inspectHorizonPagination({
      collectionText: offOriginCollectionJson,
      expectedOrigin: "https://horizon.stellar.org"
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.hasOffOriginLinks).toBe(true);
    expect(result.value.selfLink?.isOffOrigin).toBe(true);
  });

  it("identifies hostile schemes in collection links", () => {
    const result = inspectHorizonPagination({
      collectionText: hostileLinksCollectionJson,
      expectedOrigin: null
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.selfLink?.isHostileScheme).toBe(true);
    expect(result.value.selfLink?.isValidHttp).toBe(false);
    expect(result.value.nextLink?.isHostileScheme).toBe(true);
    expect(result.value.nextLink?.isValidHttp).toBe(false);
  });
});
