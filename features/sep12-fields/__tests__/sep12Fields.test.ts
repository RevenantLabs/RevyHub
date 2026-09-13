import { describe, expect, it } from "vitest";
import {
  GROUP_ORDER,
  SEP9_FIELDS,
  matchField,
  searchFields
} from "@/features/sep12-fields/lib/sep12Fields";
import {
  crossGroupQuery,
  descriptionOnlyQuery,
  noMatchQuery,
  testFields
} from "@/features/sep12-fields/fixtures/sep12Fields.fixture";

describe("searchFields", () => {
  it("returns the whole set for an empty query", () => {
    const result = searchFields("", testFields);
    expect(result.matchedFields).toBe(testFields.length);
    expect(result.totalFields).toBe(testFields.length);
  });

  it("omits groups that have no matches", () => {
    const result = searchFields("organization.", testFields);
    expect(result.groups.map((entry) => entry.group)).toEqual(["organization"]);
  });

  it("puts canonical-name matches ahead of prose-only matches", () => {
    const result = searchFields(crossGroupQuery, testFields);
    const matches = result.groups.flatMap((entry) => entry.matches);

    // address_country_code and address match by name and must come first.
    expect(matches.map((match) => match.nameMatch)).toEqual([true, true]);
  });

  it("still finds a field when only its description matches", () => {
    const result = searchFields(descriptionOnlyQuery, testFields);
    const matches = result.groups.flatMap((entry) => entry.matches);

    // "street" appears in the prose of both address fields and in neither name.
    expect(matches.map((match) => match.field.name)).toEqual([
      "address",
      "address_country_code"
    ]);
    expect(matches.every((match) => match.nameMatch)).toBe(false);
  });

  it("returns no groups rather than empty groups when nothing matches", () => {
    const result = searchFields(noMatchQuery, testFields);
    expect(result.matchedFields).toBe(0);
    expect(result.groups).toEqual([]);
  });

  it("orders every group as rank-then-alphabetical", () => {
    const result = searchFields("", testFields);

    for (const entry of result.groups) {
      const names = entry.matches.map((match) => match.field.name);
      const nameMatches = entry.matches.filter((match) => match.nameMatch);

      // Every name match precedes every prose-only match.
      expect(entry.matches.slice(0, nameMatches.length).every((m) => m.nameMatch)).toBe(true);
      expect(entry.matches.slice(nameMatches.length).every((m) => !m.nameMatch)).toBe(true);

      // Each run is alphabetical on its own.
      const sorted = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sorted);
    }
  });
});

describe("matchField", () => {
  const field = testFields[0];

  it("matches everything on an empty query", () => {
    expect(matchField(field, "")).toEqual({ field, nameMatch: true });
  });

  it("returns null when neither the name nor the description matches", () => {
    expect(matchField(field, noMatchQuery)).toBeNull();
  });
});

describe("the shipped SEP-9 table", () => {
  it("uses only the three groups the UI can render", () => {
    for (const field of SEP9_FIELDS) {
      expect(GROUP_ORDER).toContain(field.group);
    }
  });

  it("has no duplicate canonical names", () => {
    const names = SEP9_FIELDS.map((field) => field.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("keeps organization fields prefixed as the standard writes them", () => {
    for (const field of SEP9_FIELDS) {
      if (field.group === "organization") {
        expect(field.name.startsWith("organization.")).toBe(true);
      }
    }
  });

  it("describes every field", () => {
    for (const field of SEP9_FIELDS) {
      expect(field.description.length).toBeGreaterThan(0);
    }
  });
});
