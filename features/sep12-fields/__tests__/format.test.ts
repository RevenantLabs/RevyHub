import { describe, expect, it } from "vitest";
import {
  formatGroup,
  formatMatchCount,
  formatType,
  toCamelCase
} from "@/features/sep12-fields/lib/format";

describe("formatGroup", () => {
  it("labels every group in words", () => {
    expect(formatGroup("natural_person")).toBe("Natural person");
    expect(formatGroup("organization")).toBe("Organization");
    expect(formatGroup("financial_account")).toBe("Financial account");
  });
});

describe("formatType", () => {
  it("does not expose the internal type token", () => {
    expect(formatType("country_code")).toBe("Country code");
    expect(formatType("binary")).toBe("Binary image");
  });
});

describe("toCamelCase", () => {
  it("derives the spelling an integration is likely to use", () => {
    expect(toCamelCase("address_country_code")).toBe("addressCountryCode");
    expect(toCamelCase("first_name")).toBe("firstName");
  });

  it("keeps the organization prefix verbatim", () => {
    // The prefix is part of the name, not a namespace to be re-cased.
    expect(toCamelCase("organization.VAT_number")).toBe("organization.VATNumber");
    expect(toCamelCase("organization.name")).toBe("organization.name");
  });

  it("leaves a single-word name unchanged", () => {
    expect(toCamelCase("address")).toBe("address");
  });
});

describe("formatMatchCount", () => {
  it("says so in words rather than printing a bare zero", () => {
    expect(formatMatchCount(0, 48)).toBe("No fields match this search");
  });

  it("uses the singular for one match", () => {
    expect(formatMatchCount(1, 48)).toBe("1 of 48 fields matches");
  });

  it("uses the plural otherwise", () => {
    expect(formatMatchCount(3, 48)).toBe("3 of 48 fields match");
  });
});
