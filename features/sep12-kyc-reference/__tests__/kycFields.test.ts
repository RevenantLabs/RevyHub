import { describe, it, expect } from "vitest";
import { getKycFieldReference, searchKycFields, SEP12_KYC_FIELDS } from "@/features/sep12-kyc-reference/lib/kycFields";

describe("getKycFieldReference", () => {
  it("returns all fields", () => {
    const ref = getKycFieldReference();
    expect(ref.fields.length).toBeGreaterThan(0);
    expect(ref.fields.length).toBe(SEP12_KYC_FIELDS.length);
  });

  it("groups by category", () => {
    const ref = getKycFieldReference();
    expect(ref.byCategory.personal.length).toBeGreaterThan(0);
    expect(ref.byCategory.entity.length).toBeGreaterThan(0);
    expect(ref.byCategory.organization.length).toBeGreaterThan(0);
  });
});

describe("searchKycFields", () => {
  it("returns all fields when query is empty", () => {
    const results = searchKycFields("");
    expect(results.length).toBe(SEP12_KYC_FIELDS.length);
  });

  it("finds fields by name", () => {
    const results = searchKycFields("first_name");
    expect(results.length).toBe(1);
    expect(results[0].name).toBe("first_name");
  });

  it("finds fields by partial name", () => {
    const results = searchKycFields("name");
    expect(results.length).toBeGreaterThan(1);
  });

  it("finds fields by description", () => {
    const results = searchKycFields("ID document");
    expect(results.length).toBeGreaterThan(0);
  });

  it("filters by category", () => {
    const results = searchKycFields("", "personal");
    results.forEach(f => expect(f.category).toBe("personal"));
  });

  it("combines query and category filter", () => {
    const results = searchKycFields("address", "entity");
    results.forEach(f => {
      expect(f.category).toBe("entity");
    });
  });
});
