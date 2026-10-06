import { describe, expect, it } from "vitest";
import {
  determineTokenOrder,
  inspectPagination,
  parseLink
} from "@/features/horizon-pagination-inspector/lib/horizonPaginationInspector";
import {
  completePageJson,
  duplicateTokensJson,
  finalPageJson,
  jsonArray,
  jsonPrimitive,
  missingIdentifierJson,
  missingRecords,
  nextLinkWithoutCursor,
  nextLinkWithoutCursorJson,
  noLinksObjectJson,
  nonNumericTokenJson,
  notJson,
  outOfOrderTokensJson,
  pagingToken,
  recordsNotAnArray,
  shortPageWithNextJson
} from "@/features/horizon-pagination-inspector/fixtures/horizonPaginationInspector.fixture";

const inspect = (text: string) => inspectPagination({ text });

function unwrap(text: string) {
  const result = inspect(text);
  if (!result.ok) throw new Error("expected a successful inspection, got " + result.code);
  return result.value;
}

describe("inspectPagination input problems", () => {
  it("separates a non-JSON paste from a wrong-shaped one", () => {
    expect(inspect(notJson)).toEqual({ ok: false, code: "not_json" });
    expect(inspect(jsonArray)).toEqual({ ok: false, code: "not_an_object" });
    expect(inspect(jsonPrimitive)).toEqual({ ok: false, code: "not_an_object" });
  });

  it("separates a missing records array from a non-array records key", () => {
    expect(inspect(missingRecords)).toEqual({ ok: false, code: "missing_records" });
    expect(inspect(recordsNotAnArray)).toEqual({ ok: false, code: "records_not_an_array" });
  });
});

describe("inspectPagination analysis", () => {
  it("counts the records and reads the next cursor verbatim", () => {
    const value = unwrap(completePageJson);

    expect(value.recordCount).toBe(3);
    expect(value.next?.cursor).toBe(pagingToken(2));
    expect(value.prev?.cursor).toBe(pagingToken(0));
  });

  it("compares paging tokens beyond Number.MAX_SAFE_INTEGER", () => {
    // The tokens here differ by one, far above 2^53. Comparing them as numbers
    // would call them equal and report the wrong order.
    expect(unwrap(completePageJson).tokenOrder).toBe("increasing");
    expect(Number(pagingToken(0))).toBe(Number(pagingToken(1)));
  });

  it("does not treat a short page as evidence of an ending", () => {
    const value = unwrap(shortPageWithNextJson);

    expect(value.recordCount).toBe(1);
    expect(value.next).not.toBeNull();
  });

  it("reports a missing next link without claiming more than it shows", () => {
    const value = unwrap(finalPageJson);

    expect(value.hasLinksObject).toBe(true);
    expect(value.next).toBeNull();
  });

  it("distinguishes an absent links object from an absent next link", () => {
    const value = unwrap(noLinksObjectJson);

    expect(value.hasLinksObject).toBe(false);
    expect(value.next).toBeNull();
  });

  it("flags duplicate identifiers with their positions", () => {
    const value = unwrap(duplicateTokensJson);

    expect(value.duplicates).toEqual([{ key: pagingToken(0), indexes: [0, 1] }]);
  });

  it("flags records carrying no identifier at all", () => {
    expect(unwrap(missingIdentifierJson).missingIdentifiers).toEqual([1]);
  });

  it("flags non-numeric paging tokens and refuses to order them", () => {
    const value = unwrap(nonNumericTokenJson);

    expect(value.nonNumericTokens).toEqual([0]);
    expect(value.tokenOrder).toBe("undetermined");
  });

  it("reports tokens that decrease in page order", () => {
    expect(unwrap(outOfOrderTokensJson).tokenOrder).toBe("not_increasing");
  });

  it("keeps a link readable when its cursor has no value", () => {
    const value = unwrap(nextLinkWithoutCursorJson);

    expect(value.next?.cursor).toBeNull();
    expect(value.next?.href).toBe(nextLinkWithoutCursor._links.next.href);
  });
});

describe("determineTokenOrder", () => {
  it("says nothing about order when there is a single token", () => {
    expect(determineTokenOrder([1n], 0)).toBe("undetermined");
  });

  it("reports none when there are no numeric tokens", () => {
    expect(determineTokenOrder([], 2)).toBe("none");
  });

  it("refuses to order a page with non-comparable tokens", () => {
    expect(determineTokenOrder([1n, 2n], 1)).toBe("undetermined");
  });
});

describe("parseLink", () => {
  it("returns null for anything that is not a link object", () => {
    expect(parseLink(undefined)).toBeNull();
    expect(parseLink("https://example.test")).toBeNull();
    expect(parseLink({})).toBeNull();
  });

  it("splits query parameters without interpreting them", () => {
    const link = parseLink({ href: "/payments?cursor=abc%3D%3D&limit=3" });

    expect(link?.cursor).toBe("abc==");
    expect(link?.params).toContainEqual({ name: "limit", value: "3" });
  });

  it("shows a malformed escape verbatim instead of throwing", () => {
    const link = parseLink({ href: "/payments?cursor=%E0%A4%A" });

    expect(link?.cursor).toBe("%E0%A4%A");
  });
});
